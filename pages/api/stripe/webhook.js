import Stripe from "stripe";
import { buffer } from "micro";

// Disable Next.js default body parser to verify the Stripe signature
export const config = {
  api: {
    bodyParser: false,
  },
};

// [PLACEHOLDER]: Add STRIPE_WEBHOOK_SECRET to your environment variables
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  // We don't throw an error directly to avoid crashing the server build
  console.warn(
    "STRIPE_WEBHOOK_SECRET is missing. Webhooks cannot be verified.",
  );
}

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).send("Webhook secret is not configured.");
  }

  try {
    const rawBody = await buffer(req);
    const bodyStr = rawBody.toString("utf8");

    // 1. Parse the thin event securely via signature
    const thinEvent = stripeClient.parseThinEvent(bodyStr, sig, webhookSecret);

    // 2. Fetch the event data securely from Stripe's V2 API
    const event = await stripeClient.v2.core.events.retrieve(thinEvent.id);

    // 3. Handle specific V2 update events
    // Log the event details or update requirements status in the database
    if (event.type === "v2.core.account[requirements].updated") {
      const accountId = event.related_object?.id;
      console.log(`[Webhook] Account requirements updated for: ${accountId}`);
      // [PLACEHOLDER]: Fetch updated requirements and alert the user via email or dashboard
    } else if (
      event.type ===
      "v2.core.account[configuration.configuration_type].capability_status_updated"
    ) {
      const accountId = event.related_object?.id;
      console.log(`[Webhook] Capability status updated for: ${accountId}`);
      // [PLACEHOLDER]: Update internal vendor status if they became 'active'
    } else {
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
