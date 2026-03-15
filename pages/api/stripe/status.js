import Stripe from "stripe";

// [PLACEHOLDER]: Set your secret key in your environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing from environment variables.");
}

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { accountId } = req.query;

  if (!accountId) {
    return res
      .status(400)
      .json({ error: "Missing accountId query parameter." });
  }

  try {
    // 1. Retrieve the account using the V2 API
    // We include specific properties to avoid fetching massive objects.
    const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
      include: ["configuration.recipient", "requirements"],
    });

    // 2. Determine readiness to receive payments
    const stripeTransfersStatus =
      account?.configuration?.recipient?.capabilities?.stripe_balance
        ?.stripe_transfers?.status;
    const readyToReceivePayments = stripeTransfersStatus === "active";

    // 3. Determine if onboarding is complete based on requirements summary
    const requirementsStatus =
      account.requirements?.summary?.minimum_deadline?.status;
    const onboardingComplete =
      requirementsStatus !== "currently_due" &&
      requirementsStatus !== "past_due";

    return res.status(200).json({
      accountId,
      readyToReceivePayments,
      onboardingComplete,
      stripeTransfersStatus,
      requirementsStatus,
    });
  } catch (error) {
    console.error("Error fetching V2 Stripe account status:", error);
    return res.status(500).json({ error: error.message });
  }
}
