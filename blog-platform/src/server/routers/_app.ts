import { createTRPCRouter } from "../trpc";
import { postsRouter } from "./posts";
import { categoriesRouter } from "./categories";

// Main app router - merge all sub-routers here
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  categories: categoriesRouter,
});

// Export type definition of API for use on the client
export type AppRouter = typeof appRouter;
