import Cors from "micro-cors";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type RequestHandler } from "next/dist/server/next";
import { buffer } from "stream/consumers";
import type Stripe from "stripe";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { stripe } from "~/utils/stripe";

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
    }
  }

  res.status(200).json({ received: true });
};

export default cors(connect as RequestHandler);
