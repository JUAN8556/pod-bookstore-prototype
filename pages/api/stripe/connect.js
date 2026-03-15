import Stripe from 'stripe';

// [PLACEHOLDER]: Set your secret key in your environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing from environment variables.');
}

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userEmail = req.body.email || 'vendor@example.com';
    let accountId = req.body.accountId;

    if (!accountId) {
      // 2. Creating Connected Accounts using the V1 API
      // Fallback because Stripe requires Business Verification for V2 Sandboxes.
      const account = await stripeClient.accounts.create({
        type: 'express',
        country: 'MX', // Replace with dynamic country if needed
        email: userEmail,
        capabilities: {
          transfers: { requested: true },
        },
      });

      accountId = account.id;
    }

    // 3. Onboard the connected account using Account Links V1
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const accountLink = await stripeClient.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/dashboard?refresh=true`,
      return_url: `${baseUrl}/dashboard?accountId=${accountId}`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url, accountId });
  } catch (error) {
    console.error('Error in V1 Stripe Connect onboarding:', error);
    return res.status(500).json({ error: error.message });
  }
}
