import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword, createToken, setAuthCookie, clearAuthCookie } from "@/lib/auth";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
        confirmPassword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate passwords match
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Passwords do not match",
        });
      }

      // Check if username already exists
      const existingUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password);

      // Create user
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          username: input.username,
          password: hashedPassword,
        })
        .returning();

      // Create token
      const token = await createToken(newUser.id, newUser.username);
      await setAuthCookie(token);

      return {
        id: newUser.id,
        username: newUser.username,
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find user
      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(input.password, user.password);

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      // Create token
      const token = await createToken(user.id, user.username);
      await setAuthCookie(token);

      return {
        id: user.id,
        username: user.username,
      };
    }),

  logout: publicProcedure.mutation(async () => {
    await clearAuthCookie();
    return { success: true };
  }),

  getSession: publicProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
});