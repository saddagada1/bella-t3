import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const searchRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const users = await ctx.prisma.user.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                bio: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                username: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
            ],
          },
          select: {
            username: true,
            image: true,
          },
          take: 50,
        });
        const products = await ctx.prisma.product.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                department: {
                  name: {
                    contains: input.query,
                    mode: "insensitive",
                  },
                },
              },
              {
                category: {
                  name: {
                    contains: input.query,
                    mode: "insensitive",
                  },
                },
              },
              {
                subcategory: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                size: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                designers: {
                  some: {
                    name: {
                      contains: input.query,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                condition: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                sources: {
                  some: {
                    name: {
                      contains: input.query,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                eras: {
                  hasSome: [input.query],
                },
              },
              {
                styles: {
                  hasSome: [input.query],
                },
              },
              {
                colours: {
                  hasSome: [input.query],
                },
              },
            ],
          },
          take: 50,
          select: {
            id: true,
            images: true,
            price: true,
            name: true,
          },
        });
        return {
          users,
          products,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Search Bella",
        });
      }
    }),
});
