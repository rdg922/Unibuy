import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { items } from "~/server/db/schema";

export const itemRouter = createTRPCRouter({
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
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(items).values({
        name: input.name,
        description: input.description ?? "",
        price: input.price ?? 0,
        condition: input.condition ?? "used",
        category: input.category ?? "other",
        createdById: ctx.session.user.id,
        imageUrl: input.imageUrl,
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const item = await ctx.db.query.items.findFirst({
      orderBy: (items, { desc }) => [desc(items.createdAt)],
      where: eq(items.createdById, ctx.session.user.id),
    });

    return item ?? null;
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.items.findMany({
      orderBy: [desc(items.createdAt)],
      limit: 100,
    });
  }),

  getUserItems: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.items.findMany({
      orderBy: [desc(items.createdAt)],
      where: eq(items.createdById, ctx.session.user.id),
      limit: 100,
    });
  }),

  getAllItems: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.items.findMany({
      orderBy: [desc(items.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      limit: 100,
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
