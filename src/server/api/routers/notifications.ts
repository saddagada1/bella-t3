import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const notificationsRouter = createTRPCRouter({
  getUserNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.prisma.notification.findMany({
        where: { notifiedId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        skip: input.skip,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let next: typeof input.cursor = undefined;
      if (orders.length > input.limit) {
        next = orders.pop()?.id;
      }
      return {
        next: next,
        items: orders,
      };
    }),
});
