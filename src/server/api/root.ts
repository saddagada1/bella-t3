import { storeRouter } from "~/server/api/routers/store";
import { createTRPCRouter } from "~/server/api/trpc";
import { credentialsRouter } from "./routers/credentials";
import { productsRouter } from "./routers/products";
import { bagsRouter } from "./routers/bags";
import { addressesRouter } from "./routers/addresses";
import { ordersRouter } from "./routers/orders";
import { notificationsRouter } from "./routers/notifications";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  store: storeRouter,
  credentials: credentialsRouter,
  products: productsRouter,
  bags: bagsRouter,
  addresses: addressesRouter,
  orders: ordersRouter,
  notifications: notificationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
