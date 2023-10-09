import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { addressInput } from "~/utils/constants";
import { stripe } from "~/utils/stripe";

export const storeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(addressInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const stripeAccount = await stripe.accounts.create({
          type: "express",
          email: ctx.session.user.email,
          country: input.country,
          business_type: "individual",
          individual: {
            address: {
              line1: input.line1,
              line2: input.line2,
              city: input.city,
              state: input.province,
              postal_code: input.zip,
              country: input.country,
            },
            email: ctx.session.user.email,
            first_name: input.firstName,
            last_name: input.lastName,
          },
        });
        const store = await ctx.prisma.$transaction(async () => {
          const response = await ctx.prisma.store.create({
            data: {
              ...input,
              userId: ctx.session.user.id,
              stripeAccountId: stripeAccount.id,
            },
          });
          await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: { hasStore: true },
          });
          return response;
        });

        return store;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "User Already Has Store",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Create Store",
        });
      }
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const store = await ctx.prisma.store.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store Not Found",
      });
    }

    return store;
  }),

  getStripeLinkURL: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Id Provided",
        });
      }
      const accountLink = await stripe.accountLinks.create({
        account: input.id,
        refresh_url: `${env.NEXT_PUBLIC_DOMAIN}/store`,
        return_url: `${env.NEXT_PUBLIC_DOMAIN}/store`,
        type: "account_onboarding",
      });

      return accountLink.url;
    }),
});
