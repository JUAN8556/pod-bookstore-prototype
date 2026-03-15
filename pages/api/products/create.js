import Stripe from "stripe";

// [PLACEHOLDER]: Set your secret key in your environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing from environment variables.");
}

// Use a Stripe Client for all requests
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    name,
    description,
    priceInCents,
    currency = "usd",
    connectedAccountId,
  } = req.body;

  if (!name || !priceInCents || !connectedAccountId) {
    return res
      .status(400)
      .json({ error: "Missing required product parameters." });
  }

  try {
    // 1. Create Products at the Platform Level
    // The prompt specifies NOT to create it on the connected account.
    // Instead, store the mapping in the product's metadata or your database.
    const product = await stripeClient.products.create({
      name: name,
      description: description || "No description provided.",
      default_price_data: {
        unit_amount: priceInCents,
        currency: currency,
      },
      metadata: {
        vendor_account_id: connectedAccountId, // Mapping product -> connected account
      },
    });

    // [PLACEHOLDER]: Store the new Product ID and Price ID in your Prisma database here.
    // e.g., await prisma.book.create({ data: { stripeProductId: product.id, vendorId: ... } });

    return res.status(200).json({
      id: product.id,
      name: product.name,
      default_price: product.default_price,
      metadata: product.metadata,
    });
  } catch (error) {
    console.error("Error creating platform-level product:", error);
    return res.status(500).json({ error: error.message });
  }
}
