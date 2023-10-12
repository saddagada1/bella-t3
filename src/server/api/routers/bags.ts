import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const bagsRouter = createTRPCRouter({
  addToBag: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const product = await ctx.prisma.product.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            name: true,
            images: true,
            description: true,
            price: true,
            shippingPrice: true,
            storeId: true,
            store: {
              select: {
                userId: true,
              },
            },
          },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product Not Found",
          });
        }

        if (product.store.userId === ctx.session.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You Own This Product",
          });
        }

        const bag = await ctx.prisma.bag.upsert({
          where: {
            storeId_userId: {
              storeId: product.storeId,
              userId: ctx.session.user.id,
            },
          },
          update: {
            bagItems: {
              create: {
                name: product.name,
                images: product.images,
                description: product.description,
                price: product.price,
                shippingPrice: product.shippingPrice,
                productId: product.id,
              },
            },
            shippingTotal: { increment: product.shippingPrice },
            subTotal: { increment: product.price },
            grandTotal: { increment: product.price + product.shippingPrice },
          },
          create: {
            storeId: product.storeId,
            userId: ctx.session.user.id,
            bagItems: {
              create: {
                name: product.name,
                images: product.images,
                description: product.description,
                price: product.price,
                shippingPrice: product.shippingPrice,
                productId: product.id,
              },
            },
            shippingTotal: product.shippingPrice,
            subTotal: product.price,
            grandTotal: product.price + product.shippingPrice,
          },
          include: {
            bagItems: true,
            store: {
              select: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    image: true,
                    name: true,
                  },
                },
              },
            },
          },
        });
        return bag;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Product Already In Cart",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Add Product To Bag",
        });
      }
    }),

  removeFromBag: protectedProcedure
    .input(z.object({ bagId: z.string(), bagItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bag = await ctx.prisma.bag.findUnique({
        where: { id: input.bagId },
        include: { _count: { select: { bagItems: true } } },
      });

      if (bag && bag._count.bagItems <= 1) {
        await ctx.prisma.bag.delete({ where: { id: input.bagId } });
        return { deleted: "bag" };
      }
      await ctx.prisma.bagItem.delete({ where: { id: input.bagItemId } });
      return { deleted: "bagItem" };
    }),

  countBagItems: protectedProcedure.query(async ({ ctx }) => {
    const bags = await ctx.prisma.bag.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        _count: {
          select: {
            bagItems: true,
          },
        },
      },
    });

    return bags.reduce((prev, curr) => prev + curr._count.bagItems, 0);
  }),

  getUserBags: protectedProcedure.query(async ({ ctx }) => {
    const bags = await ctx.prisma.bag.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        bagItems: true,
        store: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return bags;
  }),

  getUserBag: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bag = await ctx.prisma.bag.findUnique({
        where: { id: input.id },
        include: {
          bagItems: true,
          store: {
            select: {
              user: {
                select: {
                  id: true,
                  username: true,
                  image: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!bag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bag Not Found",
        });
      }

      return bag;
    }),
});
