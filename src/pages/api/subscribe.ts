import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { query as q } from "faunadb";

import { FaunaDB } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

const handleSessionUser = async (session) => {
  const user = await FaunaDB.query<User>(
    q.Get(q.Match(q.Index("user_by_email"), q.Casefold(session.user.email)))
  );

  if (!user.data.stripe_customer_id) {
    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    });

    await FaunaDB.query(
      q.Update(q.Ref(q.Collection("users"), user.ref.id), {
        data: {
          stripe_customer_id: stripeCustomer.id,
        },
      })
    );
  }

  return user.data.stripe_customer_id;
}
export type Fruit = "Orange" | "Apple" | "Banana";

const CheckoutSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const { priceId } = req.query;

  if (req.method === "POST") {
    const session = await getSession({ req });

    const costumerId = await handleSessionUser(session);

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: costumerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};

export default CheckoutSession;
