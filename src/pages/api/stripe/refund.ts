import i18next from "i18next";
import Cors from "micro-cors";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type RequestHandler } from "next/dist/server/next";
import { buffer } from "stream/consumers";
import type Stripe from "stripe";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { notificationTemplate } from "~/utils/constants";
import { stripe } from "~/utils/stripe";

await i18next.init({
  lng: "en",
  debug: true,
  resources: {
    en: {
      translation: notificationTemplate,
    },
  },
});

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const refund = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"]!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        env.STRIPE_REFUND_SECRET,
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err);
      res.status(400).send(`Webhook Error: Unable to Verify Signature`);
      return;
    }

    const charge = event.data.object as Stripe.Charge;

    if (!charge.payment_intent || typeof charge.payment_intent !== "string") {
      res.status(400).send(`Webhook Error: Invalid Payment Intent`);
      return;
    }

    if (charge.status === "succeeded") {
      const order = await prisma.order.update({
        where: { paymentId: charge.payment_intent },
        data: {
          paymentStatus: "refunded",
        },
        include: {
          store: {
            select: {
              userId: true,
            },
          },
        },
      });
      await prisma.notification.create({
        data: {
          notifierId: order.store.userId,
          notifiedId: order.userId,
          modelId: order.id,
          message: i18next.t("updateOrder", {
            orderId: order.id,
            update: "Your refund has been processed.",
          }),
        },
      });
      await prisma.notification.create({
        data: {
          notifierId: order.userId,
          notifiedId: order.store.userId,
          modelId: order.id,
          message: i18next.t("updateOrder", {
            orderId: order.id,
            update: "The refund has been processed.",
          }),
        },
      });
    }
  }

  res.status(200).json({ received: true });
  return;
};

export default cors(refund as RequestHandler);
