import Stripe from 'stripe';

// [PLACEHOLDER]: Set your secret key in your environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing from environment variables.');
}

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { accountId } = req.query;

  if (!accountId) {
    return res.status(400).json({ error: 'Missing accountId query parameter.' });
  }

  try {
    // 1. Retrieve the account using the V1 API
    const account = await stripeClient.accounts.retrieve(accountId);

    // 2. Determine readiness to receive payments
    const stripeTransfersStatus = account.capabilities?.transfers;
    const readyToReceivePayments = stripeTransfersStatus === 'active';

    // 3. Determine if onboarding is complete based on requirements summary
    const requirementsStatus = account.requirements?.currently_due || [];
    const onboardingComplete = requirementsStatus.length === 0;

    return res.status(200).json({
      accountId,
      readyToReceivePayments,
      onboardingComplete,
      stripeTransfersStatus,
      requirementsStatus,
    });
  } catch (error) {
    console.error('Error fetching V1 Stripe account status:', error);
    return res.status(500).json({ error: error.message });
  }
}
