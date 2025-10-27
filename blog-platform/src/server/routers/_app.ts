import { createTRPCRouter } from "../trpc";
import { postsRouter } from "./posts";
import { categoriesRouter } from "./categories";
import { authRouter } from "./auth";

// Main app router - merge all sub-routers here
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  categories: categoriesRouter,
  auth: authRouter,
});

// Export type definition of API for use on the client
export type AppRouter = typeof appRouter;
