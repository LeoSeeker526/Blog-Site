import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { makeQueryClient } from "./query-client";
import { appRouter, type AppRouter } from "@/server/routers/_app";
import { createCallerFactory } from "@/server/trpc";
import { createTRPCContext } from "@/server/trpc";

// Create tRPC caller
export const createCaller = createCallerFactory(appRouter);

// Create context and caller for server
const getQueryClient = cache(makeQueryClient);
const caller = createCaller(async () => await createTRPCContext());

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);
