import Stripe from "stripe";

// [PLACEHOLDER]: Set your secret key in your environment variables.
// Use process.env.STRIPE_SECRET_KEY. Throw an error if it's not present.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing from environment variables.");
}

// 1. Initialize the Stripe Client
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // [PLACEHOLDER]: In a real application, retrieve the user from the database.
    // e.g., const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const userDisplayName = req.body.name || "Vendor Demo";
    const userEmail = req.body.email || "vendor@example.com";
    let accountId = req.body.accountId; // Pass existing account ID if we already created it.

    if (!accountId) {
      // 2. Creating Connected Accounts using the V2 API
      // Note: We use specific properties instead of top-level `type: 'express'`.
      const account = await stripeClient.v2.core.accounts.create({
        display_name: userDisplayName,
        contact_email: userEmail,
        identity: {
          country: "mx", // or 'us', default country for the account
        },
        dashboard: "express",
        defaults: {
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: {
                  requested: true,
                },
              },
            },
          },
        },
      });

      accountId = account.id;

      // [PLACEHOLDER]: Store the mapping from user to the account ID in the DB.
      // await prisma.vendor.update({ where: { id: user.id }, data: { stripeAccountId: accountId } });
    }

    // 3. Onboard the connected account using Account Links
    // Generate a URL to securely redirect the user to complete their Stripe profile.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const accountLink = await stripeClient.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: `${baseUrl}/dashboard?refresh=true`,
          return_url: `${baseUrl}/dashboard?accountId=${accountId}`,
        },
      },
    });

    // Extract the URL from the V2 account link object
    const onboardingUrl =
      accountLink.account_onboarding?.url || accountLink.url;

    if (!onboardingUrl) {
      throw new Error("Could not retrieve the onboarding URL from Stripe.");
    }

    return res.status(200).json({ url: onboardingUrl, accountId });
  } catch (error) {
    console.error("Error in V2 Stripe Connect onboarding:", error);
    return res.status(500).json({ error: error.message });
  }
}
