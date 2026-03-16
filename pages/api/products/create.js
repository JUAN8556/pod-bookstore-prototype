import Stripe from "stripe";
import prisma from "../../../lib/prisma";

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
    coverUrl,
    pdfUrl,
  } = req.body;

  if (!name || !priceInCents || !connectedAccountId) {
    return res
      .status(400)
      .json({ error: "Missing required product parameters." });
  }

  try {
    const product = await stripeClient.products.create({
      name: name,
      description: description || "No description provided.",
      default_price_data: {
        unit_amount: priceInCents,
        currency: currency,
      },
      metadata: {
        vendor_account_id: connectedAccountId,
      },
      images: coverUrl ? [coverUrl] : [],
    });

    // Mocking standard Next-Auth flow for demo purposes
    const mockUserId = "11111111-1111-1111-1111-111111111111";

    // Upsert User
    await prisma.user.upsert({
      where: { id: mockUserId },
      update: {},
      create: {
        id: mockUserId,
        email: "vendor@example.com",
        name: "Vendor Demo",
        role: "VENDOR",
      },
    });

    // Upsert Vendor
    await prisma.vendor.upsert({
      where: { id: mockUserId },
      update: { stripeAccountId: connectedAccountId },
      create: {
        id: mockUserId,
        storeName: "Códice Autor",
        stripeAccountId: connectedAccountId,
      },
    });

    // 3. Save Book to Prisma DB
    const dbBook = await prisma.book.create({
      data: {
        vendorId: mockUserId,
        title: name,
        description: description,
        retailPrice: priceInCents / 100, // Decimal format $25.00
        coverUrl: coverUrl,
        pdfUrl: pdfUrl,
        isActive: true,
      },
    });

    return res.status(200).json({
      id: dbBook.id,
      stripe_product_id: product.id,
      name: product.name,
      metadata: product.metadata,
    });
  } catch (error) {
    console.error("Error creating platform-level product:", error);
    return res.status(500).json({ error: error.message });
  }
}
