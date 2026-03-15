import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Adjust to a modern version
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. En producción, aquí sacaríamos el ID de usuario de la sesión (`req.session`)
    //    y buscaríamos si ya tiene un `stripe_account_id` en la base de datos (Prisma).
    //    Para esta maqueta funcional, vamos a crear una cuenta nueva de prueba siempre.

    // 2. Crear una nueva cuenta "Express" en Stripe Connect
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // O el país del autor, se puede hacer dinámico después
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
    });

    // 3. Crear el link de registro (Onboarding)
    // Este link redirige al autor al panel oficial de Stripe
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?success=true&account=${account.id}`,
      type: 'account_onboarding',
    });

    // 4. Devolver el link al Frontend
    return res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return res.status(500).json({ error: error.message });
  }
}
