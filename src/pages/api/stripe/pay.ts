import Cors from "micro-cors";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type RequestHandler } from "next/dist/server/next";
import { buffer } from "stream/consumers";
import type Stripe from "stripe";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { notificationTemplates } from "~/utils/constants";
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

const pay = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"]!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        env.STRIPE_PAY_SECRET,
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err);
      res.status(400).send(`Webhook Error: Unable to Verify Signature`);
      return;
    }

    try {
      if (event.type === "checkout.session.completed") {
        const stripeOrder = event.data.object as Stripe.Checkout.Session;
        if (!stripeOrder.client_reference_id) {
          res.status(400).send(`Webhook Error: No Client Reference Id`);
          return;
        }
        const reference = JSON.parse(
          stripeOrder.client_reference_id,
        ) as CheckoutReference;

        if (
          !stripeOrder.payment_intent ||
          typeof stripeOrder.payment_intent !== "string"
        ) {
          res.status(400).send(`Webhook Error: Invalid Payment Intent`);
          return;
        }

        const paymentId = stripeOrder.payment_intent;
        const order = await prisma.$transaction(async () => {
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
            throw "Webhook Error: Bag Not Found";
          }

          const response = await prisma.order.create({
            data: {
              storeId: reference.storeId,
              userId: reference.userId,
              addressId: reference.addressId,
              paymentId: paymentId,
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
              subTotal: bag.bagItems.reduce(
                (prev, curr) => prev + curr.price,
                0,
              ),
              grandTotal: bag.bagItems.reduce(
                (prev, curr) => prev + (curr.price + curr.shippingPrice),
                0,
              ),
            },
          });

          await prisma.store.update({
            where: { id: reference.storeId },
            data: { ordersCount: { increment: 1 } },
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
              storeId_userId: {
                storeId: bag.storeId,
                userId: reference.userId,
              },
            },
          });

          return response;
        });
        await prisma.notification.create({
          data: {
            notifierId: reference.userId,
            notifiedId: reference.sellerId,
            schemaId: order.id,
            action: "NEW_ORDER",
            message: notificationTemplates.NEW_ORDER({}),
          },
        });
      } else if (event.type === "payment_intent.succeeded") {
        const stripeOrder = event.data.object as Stripe.PaymentIntent;
        const order = await prisma.order.update({
          where: { paymentId: stripeOrder.id },
          data: {
            paymentStatus: "completed",
          },
          include: {
            store: {
              select: {
                userId: true,
              },
            },
            user: {
              select: {
                id: true,
              },
            },
          },
        });
        await prisma.notification.create({
          data: {
            notifierId: order.user.id,
            notifiedId: order.store.userId,
            schemaId: order.id,
            action: "UPDATE_ORDER",
            message: notificationTemplates.UPDATE_ORDER({
              orderId: order.id,
              update: "The payment has been processed.",
            }),
          },
        });
        await prisma.notification.create({
          data: {
            notifierId: order.store.userId,
            notifiedId: order.user.id,
            schemaId: order.id,
            action: "UPDATE_ORDER",
            message: notificationTemplates.UPDATE_ORDER({
              orderId: order.id,
              update: "Your payment has been processed.",
            }),
          },
        });
      } else if (event.type === "payment_intent.payment_failed") {
        const stripeOrder = event.data.object as Stripe.PaymentIntent;
        const order = await prisma.order.update({
          where: { paymentId: stripeOrder.id },
          data: {
            paymentStatus: "failed",
          },
          include: {
            store: {
              select: {
                userId: true,
              },
            },
            user: {
              select: {
                id: true,
              },
            },
          },
        });
        await prisma.notification.create({
          data: {
            notifierId: order.user.id,
            notifiedId: order.store.userId,
            schemaId: order.id,
            action: "UPDATE_ORDER",
            message: notificationTemplates.UPDATE_ORDER({
              orderId: order.id,
              update: "The payment could not be processed.",
            }),
          },
        });
        await prisma.notification.create({
          data: {
            notifierId: order.store.userId,
            notifiedId: order.user.id,
            schemaId: order.id,
            action: "UPDATE_ORDER",
            message: notificationTemplates.UPDATE_ORDER({
              orderId: order.id,
              update: "Your payment could not be processed.",
            }),
          },
        });
      }
    } catch (error) {
      res
        .status(400)
        .send(error ?? `Webhook Error: Could Not Create or Update Order`);
      return;
    }
  }
  res.status(200).json({ received: true });
  return;
};

export default cors(pay as RequestHandler);
