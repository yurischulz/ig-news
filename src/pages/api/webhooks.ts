import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import Stripe from 'stripe';
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export const MAP_SESSION = {
  COMPLETED: 'checkout.session.completed',
}

export const MAP_CUSTOMER = {
  UPDATED: 'customer.subscription.updated',
  DELETED: 'customer.subscription.deleted',
}

const handleStripeEvents = async (type, event) => {
  switch (type) {
    case MAP_CUSTOMER.UPDATED:
    case MAP_CUSTOMER.DELETED:
      const subscription = event.data.object as Stripe.Subscription;

      await saveSubscription(
        subscription.id,
        subscription.customer.toString(),
        false
      );

      break;

    case MAP_SESSION.COMPLETED:
      const checkoutSession = event.data.object as Stripe.Checkout.Session;

      await saveSubscription(
        checkoutSession.subscription.toString(),
        checkoutSession.customer.toString(),
        true
      );

      break;
    default:
      throw new Error('Unhandled event.');
  }
}

const StripeWebhooks = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const secret = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      // eslint-disable-next-line
      try {
        await handleStripeEvents(type, event);
      } catch (error) {
        return res.json({ error: error.message });
      }
    }

    return res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};

export default StripeWebhooks;
