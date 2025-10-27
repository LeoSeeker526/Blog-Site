import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { db } from "@/db";

// Create context for each request
export const createTRPCContext = cache(async () => {
  return {
    db,
    // You can add authentication here later:
    // session: await auth(),
  };
});

// Export type for use in other files
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC with context
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === "ZodError"
            ? error.cause
            : null,
      },
    };
  },
});

// Export reusable router and procedure builders
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// Base procedure - available to everyone
export const publicProcedure = t.procedure;
