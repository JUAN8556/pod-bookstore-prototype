import Stripe from 'stripe';
import products from '../../products.json';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required.' });
    }

    try {
        const product = products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.title,
                        images: [product.image_url],
                    },
                    unit_amount: product.price_cents,
                },
                quantity: quantity,
            }],
            mode: 'payment',
            success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/`,
        });
        
        res.status(200).json({ url: session.url });

    } catch (err) {
        console.error('Stripe API Error:', err.message);
        res.status(500).json({ error: 'Failed to create payment session.' });
    }
}
