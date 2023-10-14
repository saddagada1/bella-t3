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
        const store = await ctx.prisma.store.findUnique({
          where: { userId: ctx.session.user.id },
        });

        if (!store) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unable To Create Product",
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
        select: {
          id: true,
          images: true,
          price: true,
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

  getStoreProducts: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
        sold: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        where: { store: { userId: ctx.session.user.id }, sold: !!input.sold },
        orderBy: {
          updatedAt: "desc",
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        select: {
          id: true,
          images: true,
          price: true,
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
});
