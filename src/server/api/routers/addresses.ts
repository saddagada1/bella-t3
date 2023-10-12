import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { addressInput } from "~/utils/constants";

export const addressesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(addressInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const address = await ctx.prisma.address.create({
          data: { ...input, userId: ctx.session.user.id },
        });
        return address;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Save Address",
        });
      }
    }),

  getUserAddresses: protectedProcedure.query(async ({ ctx }) => {
    const addresses = await ctx.prisma.address.findMany({
      where: { userId: ctx.session.user.id },
    });

    return addresses;
  }),
});
