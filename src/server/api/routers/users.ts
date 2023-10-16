import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  getSessionUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        username: true,
        bio: true,
        password: true,
        followersCount: true,
        followingCount: true,
        store: {
          select: {
            productsCount: true,
          },
        },
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Unable To Find Session User",
      });
    }

    const { password, ...rest } = user;

    if (!password) {
      return {
        ...rest,
        hasPassword: false,
      };
    }

    return {
      ...rest,
      hasPassword: true,
    };
  }),
  getUser: publicProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { username: input.username },
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
          bio: true,
          followersCount: true,
          followingCount: true,
          followers: {
            where: { followerId: ctx.session?.user.id },
            select: { followerId: true, followedId: true },
          },
          store: {
            select: {
              productsCount: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unable To Find User",
        });
      }

      return user;
    }),

  follow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const follow = await ctx.prisma.$transaction(async () => {
          const response = await ctx.prisma.follow.create({
            data: { followerId: ctx.session.user.id, followedId: input.id },
          });
          await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: {
              followingCount: { increment: 1 },
            },
          });
          await ctx.prisma.user.update({
            where: { id: input.id },
            data: {
              followersCount: { increment: 1 },
            },
          });
          return response;
        });
        return follow;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Already Following User",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Follow User",
        });
      }
    }),

  unfollow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.prisma.$transaction(async () => {
          await ctx.prisma.follow.delete({
            where: {
              followedId_followerId: {
                followedId: input.id,
                followerId: ctx.session.user.id,
              },
            },
          });
          await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: {
              followingCount: { decrement: 1 },
            },
          });
          await ctx.prisma.user.update({
            where: { id: input.id },
            data: {
              followersCount: { decrement: 1 },
            },
          });
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Not Following User",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Unfollow User",
        });
      }
    }),
});
