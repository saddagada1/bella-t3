import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { v4 } from "uuid";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { productInput } from "~/utils/constants";
import { uploadObjects } from "~/utils/s3";

const productFilters = z.object({
  subcategory: z.string().optional(),
  condition: z.string().optional(),
  size: z.string().optional(),
  colours: z.object({ hasSome: z.array(z.string()) }).optional(),
  eras: z.object({ hasSome: z.array(z.string()) }).optional(),
  styles: z.object({ hasSome: z.array(z.string()) }).optional(),
  country: z.string().optional(),
  sold: z.boolean().optional(),
});

export const productsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      productInput.merge(
        z.object({
          department: z.object({ id: z.number(), name: z.string() }),
          designers: z.array(
            z.object({ id: z.number(), name: z.string(), slug: z.string() }),
          ),
          shippingPrice: z.number(),
          price: z.number(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        numImages,
        department,
        category,
        designers,
        sources,
        ...product
      } = input;
      try {
        if (!ctx.session.user.verified || !ctx.session.user.canSell) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unable To Create Product",
          });
        }

        const store = await ctx.prisma.store.findUnique({
          where: { userId: ctx.session.user.id },
        });

        if (!store) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User Does Not Have A Store",
          });
        }

        const images = Array.from({ length: numImages }).map(() => v4());

        const response = await ctx.prisma.$transaction(async () => {
          await ctx.prisma.department.upsert({
            where: department,
            update: {},
            create: department,
          });
          const categoryModel = await ctx.prisma.category.upsert({
            where: {
              name_departmentId: {
                name: category,
                departmentId: department.id,
              },
            },
            update: {},
            create: {
              name: category,
              departmentId: department.id,
            },
          });
          const res = await ctx.prisma.product.create({
            data: {
              ...product,
              images,
              storeId: store.id,
              departmentId: department.id,
              categoryId: categoryModel.id,
              designers: {
                connectOrCreate: designers.map((designer) => {
                  return {
                    where: { id: designer.id },
                    create: {
                      id: designer.id,
                      name: designer.name,
                      slug: designer.slug,
                    },
                  };
                }),
              },
              sources: {
                connectOrCreate: sources.map((source) => {
                  return {
                    where: { name: source },
                    create: { name: source },
                  };
                }),
              },
            },
          });

          return res;
        });

        const uploadUrls = await uploadObjects(images);

        return {
          uploadUrls,
          id: response.id,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Create Product",
        });
      }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        include: {
          department: {
            select: { name: true },
          },
          category: {
            select: { name: true },
          },
          designers: {
            select: {
              name: true,
            },
          },
          sources: {
            select: {
              name: true,
            },
          },
          likes: {
            where: { userId: ctx.session?.user.id },
            select: { userId: true, productId: true },
          },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product Not Found",
        });
      }

      return product;
    }),

  getUserProducts: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        where: { store: { userId: ctx.session.user.id } },
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          images: true,
          price: true,
          name: true,
        },
        skip: input.skip,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let next: typeof input.cursor = undefined;
      if (products.length > input.limit) {
        next = products.pop()?.id;
      }
      return {
        next: next,
        items: products,
      };
    }),

  getStoreProducts: publicProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        where: { store: { userId: input.id } },
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          images: true,
          price: true,
          name: true,
        },
        skip: input.skip,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let next: typeof input.cursor = undefined;
      if (products.length > input.limit) {
        next = products.pop()?.id;
      }
      return {
        next: next,
        items: products,
      };
    }),

  getProducts: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
        filter: productFilters.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        where: input.filter,
        select: {
          id: true,
          images: true,
          price: true,
          name: true,
        },
        skip: input.skip,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let next: typeof input.cursor = undefined;
      if (products.length > input.limit) {
        next = products.pop()?.id;
      }
      return {
        next: next,
        items: products,
      };
    }),

  like: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const like = await ctx.prisma.$transaction(async () => {
          const response = await ctx.prisma.like.create({
            data: { userId: ctx.session.user.id, productId: input.id },
          });
          await ctx.prisma.product.update({
            where: { id: input.id },
            data: {
              likesCount: { increment: 1 },
            },
          });
          return response;
        });
        return like;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Already Liked Product",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Like Product",
        });
      }
    }),

  unlike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.prisma.$transaction(async () => {
          await ctx.prisma.like.delete({
            where: {
              productId_userId: {
                productId: input.id,
                userId: ctx.session.user.id,
              },
            },
          });
          await ctx.prisma.product.update({
            where: { id: input.id },
            data: {
              likesCount: { decrement: 1 },
            },
          });
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Product Not Liked",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Unlike Product",
        });
      }
    }),
});
