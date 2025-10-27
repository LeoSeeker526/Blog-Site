import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const categoriesRouter = createTRPCRouter({
  // Get all categories
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(categories);
  }),

  // Get a single category by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db
        .select()
        .from(categories)
        .where(eq(categories.slug, input.slug))
        .limit(1);

      if (!category[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category[0];
    }),

  // Create a new category
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        slug: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const existingCategory = await ctx.db
        .select()
        .from(categories)
        .where(eq(categories.slug, input.slug))
        .limit(1);

      if (existingCategory.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this slug already exists",
        });
      }

      const [newCategory] = await ctx.db
        .insert(categories)
        .values(input)
        .returning();

      return newCategory;
    }),

  // Update a category
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        slug: z.string().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [updatedCategory] = await ctx.db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id))
        .returning();

      if (!updatedCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return updatedCategory;
    }),

  // Delete a category
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedCategory] = await ctx.db
        .delete(categories)
        .where(eq(categories.id, input.id))
        .returning();

      if (!deletedCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return deletedCategory;
    }),
});
