import Stripe from "stripe";

// [PLACEHOLDER]: Add your STRIPE_SECRET_KEY to your environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing from environment variables.");
}

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  // [PLACEHOLDER]: Ensure you pass 'productId' and 'quantity' from your storefront
  // as well as the mapped connected account and product price in your database.
  const {
    productId,
    quantity = 1,
    connectedAccountId,
    priceInCents,
    productName,
  } = req.body;

  if (!productId || !connectedAccountId || !priceInCents) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    // 1. Process Charges using a Destination Charge
    // Monetize the transaction by keeping an application fee.
    const platformFeeCents = 200; // e.g., $2.00 flat fee per item

    // We use hosted checkout for simplicity as requested
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName || "Product from Platform",
            },
            unit_amount: priceInCents,
          },
          quantity: quantity,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFeeCents * quantity,
        transfer_data: {
          destination: connectedAccountId, // Send the remainder to the seller's connected account
        },
      },
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe Checkout Session:", error);
    res.status(500).json({ error: error.message });
  }
}
