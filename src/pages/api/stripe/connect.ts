import Cors from "micro-cors";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type RequestHandler } from "next/dist/server/next";
import { buffer } from "stream/consumers";
import type Stripe from "stripe";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { stripe } from "~/utils/stripe";
import { type CheckoutReference } from "~/utils/types";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const connect = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"]!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        env.STRIPE_CONNECT_SECRET,
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err);
      res.status(400).send(`Webhook Error: Unable to Verify Signature`);
      return;
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled) {
        await prisma.store.update({
          where: { stripeAccountId: account.id },
          data: {
            stripeSetupStatus: "complete",
            user: {
              update: {
                canSell: true,
              },
            },
          },
        });
      } else if (!account.charges_enabled && account.details_submitted) {
        await prisma.store.update({
          where: { stripeAccountId: account.id },
          data: {
            stripeSetupStatus: "in_progress",
          },
        });
      }
    } else if (event.type.startsWith("checkout.session")) {
      const order = event.data.object as Stripe.Checkout.Session;
      if (!order.client_reference_id) {
        res.status(400).send(`Webhook Error: No Client Reference Id`);
        return;
      }
      const reference = JSON.parse(
        order.client_reference_id,
      ) as CheckoutReference;
      if (event.type === "checkout.session.completed") {
        const bag = await prisma.bag.findUnique({
          where: { id: reference.bagId },
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
          res.status(400).send(`Webhook Error: Bag Not Found`);
          return;
        }

        await prisma.order.create({
          data: {
            ...reference,
            orderItems: {
              create: bag.bagItems.map((item) => ({
                name: item.name,
                images: item.images,
                description: item.description,
                price: item.price,
                shippingPrice: item.shippingPrice,
                productId: item.productId,
              })),
            },
            shippingTotal: bag.bagItems.reduce(
              (prev, curr) => prev + curr.shippingPrice,
              0,
            ),
            subTotal: bag.bagItems.reduce((prev, curr) => prev + curr.price, 0),
            grandTotal: bag.bagItems.reduce(
              (prev, curr) => prev + (curr.price + curr.shippingPrice),
              0,
            ),
          },
        });

        await prisma.product.updateMany({
          where: { id: { in: bag.bagItems.map((item) => item.productId) } },
          data: {
            sold: true,
          },
        });

        await prisma.bag.delete({
          where: {
            id: bag.id,
            storeId_userId: { storeId: bag.storeId, userId: reference.userId },
          },
        });
      } else if (event.type === "checkout.session.async_payment_succeeded") {
        await prisma.order.update({
          where: { storeId_userId_addressId: reference },
          data: {
            orderStatus: "in_progress",
            paymentStatus: "completed",
          },
        });
      } else if (event.type === "checkout.session.async_payment_failed") {
        await prisma.order.update({
          where: { storeId_userId_addressId: reference },
          data: {
            orderStatus: "in_progress",
            paymentStatus: "failed",
          },
        });
      }
    }
  }

  res.status(200).json({ received: true });
  return;
};

export default cors(connect as RequestHandler);
