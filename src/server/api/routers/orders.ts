import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { applicationFeePercentage, currencies } from "~/utils/constants";
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
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Create Stripe Session",
        });
      }
    }),

  getUserOrders: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        orderItems: true,
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

    return orders;
  }),
});
