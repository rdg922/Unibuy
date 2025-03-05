import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        condition: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        description: input.description || "",
        price: input.price || 0,
        condition: input.condition || "used",
        category: input.category || "other",
        createdById: ctx.session.user.id,
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      where: eq(posts.createdById, ctx.session.user.id),
    });

    return post ?? null;
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: 100,
    });
  }),

  getUserItems: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      where: eq(posts.createdById, ctx.session.user.id),
      limit: 100,
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
