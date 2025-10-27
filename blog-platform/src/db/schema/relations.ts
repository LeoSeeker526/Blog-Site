import { relations } from "drizzle-orm";
import { posts } from "./posts";
import { categories } from "./categories";
import { postCategories } from "./postCategories";

// Posts relations
export const postsRelations = relations(posts, ({ many }) => ({
  postCategories: many(postCategories),
}));

// Categories relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  postCategories: many(postCategories),
}));

// Junction table relations
export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id],
  }),
}));
