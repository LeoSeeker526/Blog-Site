import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { posts, postCategories, categories } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const postsRouter = createTRPCRouter({
  // Get all posts with optional filtering
  getAll: publicProcedure
    .input(
      z
        .object({
          published: z.boolean().optional(),
          categoryId: z.number().optional(),
          limit: z.number().min(1).max(100).default(10),
          cursor: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      // Build the base query with conditional where clause
      let baseQuery = ctx.db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          slug: posts.slug,
          published: posts.published,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
        })
        .from(posts)
        .$dynamic();

      // Add published filter if specified
      if (input?.published !== undefined) {
        baseQuery = baseQuery.where(eq(posts.published, input.published));
      }

      // Complete the query
      const postsResult = await baseQuery
        .orderBy(desc(posts.createdAt))
        .limit(limit + 1)
        .offset(cursor ?? 0);

      // Fetch categories for these posts
      const postIds = postsResult.map((p) => p.id);
      
      let categoriesMap: Record<number, Array<{ id: number; name: string; slug: string }>> = {};
      
      if (postIds.length > 0) {
        const postCategoriesResult = await ctx.db
          .select({
            postId: postCategories.postId,
            categoryId: categories.id,
            categoryName: categories.name,
            categorySlug: categories.slug,
          })
          .from(postCategories)
          .innerJoin(categories, eq(postCategories.categoryId, categories.id))
          .where(inArray(postCategories.postId, postIds));

        // Build categories map
        postCategoriesResult.forEach((pc) => {
          if (!categoriesMap[pc.postId]) {
            categoriesMap[pc.postId] = [];
          }
          categoriesMap[pc.postId].push({
            id: pc.categoryId,
            name: pc.categoryName,
            slug: pc.categorySlug,
          });
        });
      }

      // Combine posts with their categories
      let items = postsResult.map((post) => ({
        ...post,
        categories: categoriesMap[post.id] || [],
      }));

      // Filter by categoryId if provided
      if (input?.categoryId) {
        items = items.filter((item) =>
          item.categories.some((cat) => cat.id === input.categoryId)
        );
      }

      let nextCursor: number | undefined = undefined;
      if (items.length > limit) {
        items.pop();
        nextCursor = (cursor ?? 0) + limit;
      }

      return {
        items,
        nextCursor,
      };
    }),

  // Get a single post by slug with categories
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const postResult = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);

      if (!postResult[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const post = postResult[0];

      // Fetch categories for this post
      const categoriesResult = await ctx.db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
        })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post.id));

      return {
        ...post,
        categories: categoriesResult,
      };
    }),

  // Get post by ID with categories (for editing)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const postResult = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);

      if (!postResult[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const post = postResult[0];

      // Fetch categories for this post
      const categoriesResult = await ctx.db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post.id));

      return {
        ...post,
        categories: categoriesResult,
      };
    }),

  // Create a new post
create: publicProcedure
  .input(
    z.object({
      title: z.string().min(1).max(255),
      content: z.string().min(1),
      slug: z.string().min(1).max(255),
      published: z.boolean().default(false),
      categoryIds: z.array(z.number()).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { categoryIds, ...postData } = input;

    // Debug: Log the userId
    console.log("Creating post with userId:", ctx.userId);

    if (!ctx.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to create a post",
      });
    }

    const existingPost = await ctx.db
      .select()
      .from(posts)
      .where(eq(posts.slug, postData.slug))
      .limit(1);

    if (existingPost.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A post with this slug already exists",
      });
    }

    // Explicitly set userId
    const [newPost] = await ctx.db
      .insert(posts)
      .values({
        title: postData.title,
        content: postData.content,
        slug: postData.slug,
        published: postData.published,
        userId: ctx.userId, // Explicitly pass userId as a number
      })
      .returning();

    if (categoryIds && categoryIds.length > 0) {
      await ctx.db.insert(postCategories).values(
        categoryIds.map((categoryId) => ({
          postId: newPost.id,
          categoryId,
        }))
      );
    }

    return newPost;
  }),


  // Update a post
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
        slug: z.string().min(1).max(255).optional(),
        published: z.boolean().optional(),
        categoryIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, categoryIds, ...updateData } = input;

      // Check if post exists
      const existingPost = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);

      if (!existingPost[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      // Update the post
      const [updatedPost] = await ctx.db
        .update(posts)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();

      // Update categories if provided
      if (categoryIds !== undefined) {
        // Remove existing categories
        await ctx.db
          .delete(postCategories)
          .where(eq(postCategories.postId, id));

        // Add new categories
        if (categoryIds.length > 0) {
          await ctx.db.insert(postCategories).values(
            categoryIds.map((categoryId) => ({
              postId: id,
              categoryId,
            }))
          );
        }
      }

      return updatedPost;
    }),

  // Delete a post
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedPost] = await ctx.db
        .delete(posts)
        .where(eq(posts.id, input.id))
        .returning();

      if (!deletedPost) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return deletedPost;
    }),
});
