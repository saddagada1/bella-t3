import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  applicationFeePercentage,
  currencies,
  notificationTemplates,
} from "~/utils/constants";
import { stripe } from "~/utils/stripe";
import { type CheckoutReference } from "~/utils/types";

export const ordersRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(z.object({ bagId: z.string(), addressId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const bag = await ctx.prisma.bag.findUnique({
          where: { id: input.bagId },
          include: {
            bagItems: true,
            store: {
              select: {
                stripeAccountId: true,
                country: true,
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

        const currency = currencies[bag.store.country];

        if (!currency) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid Store Country",
          });
        }

        const reference: CheckoutReference = {
          bagId: bag.id,
          storeId: bag.storeId,
          sellerId: bag.store.user.id,
          userId: ctx.session.user.id,
          addressId: input.addressId,
        };

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          client_reference_id: JSON.stringify(reference),
          line_items: await Promise.all(
            bag.bagItems.map((item) => {
              const images = item.images.map(
                (image) => env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + image,
              );
              return {
                price_data: {
                  currency,
                  product_data: {
                    name: item.name,
                    images: images,
                  },
                  unit_amount: item.price + item.shippingPrice,
                },
                quantity: 1,
              };
            }),
          ),
          payment_intent_data: {
            application_fee_amount: Math.ceil(
              bag.bagItems
                .map((item) => item.price + item.shippingPrice)
                .reduce((currentSum, value) => currentSum + value) *
                applicationFeePercentage,
            ),
            transfer_data: {
              destination: bag.store.stripeAccountId,
            },
          },
          success_url: `${env.NEXT_PUBLIC_DOMAIN}/orders`,
          cancel_url: `${env.NEXT_PUBLIC_DOMAIN}/bag`,
        });

        if (!session.url) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable To Create Stripe Session",
          });
        }

        return session.url;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        //console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Create Stripe Session",
        });
      }
    }),

  cancelOrder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        paymentId: z.string(),
        storeId: z.string(),
        type: z.enum(["store", "user"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: { id: input.storeId },
        });
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store Not Found",
          });
        }
        await stripe.refunds.create(
          {
            payment_intent: input.paymentId,
            refund_application_fee: true,
          },
          {
            stripeAccount: store.stripeAccountId,
          },
        );
        if (input.type === "store") {
          const order = await ctx.prisma.order.update({
            where: { id: input.id, store: { userId: ctx.session.user.id } },
            data: {
              orderStatus: "cancelled",
              paymentStatus: "processing_refund",
            },
            include: {
              address: true,
              orderItems: true,
              user: {
                select: {
                  image: true,
                  username: true,
                  name: true,
                },
              },
            },
          });
          await ctx.prisma.notification.create({
            data: {
              notifierId: ctx.session.user.id,
              notifiedId: order.userId,
              schemaId: order.id,
              action: "CANCEL_ORDER",
              message: notificationTemplates.CANCEL_ORDER({
                orderId: order.id,
                message: "Your refund is being processed.",
              }),
            },
          });
          return order;
        } else {
          const order = await ctx.prisma.order.update({
            where: { id: input.id, userId: ctx.session.user.id },
            data: {
              orderStatus: "cancelled",
              paymentStatus: "processing_refund",
            },
            include: {
              address: true,
              orderItems: true,
              store: {
                select: {
                  user: {
                    select: {
                      image: true,
                      username: true,
                      name: true,
                    },
                  },
                },
              },
            },
          });
          await ctx.prisma.notification.create({
            data: {
              notifierId: ctx.session.user.id,
              notifiedId: store.userId,
              schemaId: order.id,
              action: "CANCEL_ORDER",
              message: notificationTemplates.CANCEL_ORDER({
                orderId: order.id,
                message: "The refund is being processed.",
              }),
            },
          });
          return order;
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        //console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Create Stripe Session",
        });
      }
    }),

  getUserOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.prisma.order.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: true,
          address: true,
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

  getStoreOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.prisma.order.findMany({
        where: { store: { userId: ctx.session.user.id } },
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: true,
          address: true,
          user: {
            select: {
              id: true,
              username: true,
              image: true,
              name: true,
            },
          },
        },
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
