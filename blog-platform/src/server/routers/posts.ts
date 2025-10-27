import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { posts, postCategories } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const postsRouter = createTRPCRouter({
  // Get all posts with optional filtering
  getAll: publicProcedure
    .input(
      z
        .object({
          published: z.boolean().optional(),
          limit: z.number().min(1).max(100).default(10),
          cursor: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      const items = await ctx.db
        .select()
        .from(posts)
        .where(
          input?.published !== undefined
            ? eq(posts.published, input.published)
            : undefined
        )
        .orderBy(desc(posts.createdAt))
        .limit(limit + 1)
        .offset(cursor ?? 0);

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

  // Get a single post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);

      if (!post[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return post[0];
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

      // Check if slug already exists
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

      // Insert the post
      const [newPost] = await ctx.db
        .insert(posts)
        .values(postData)
        .returning();

      // Add category relationships if provided
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

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
