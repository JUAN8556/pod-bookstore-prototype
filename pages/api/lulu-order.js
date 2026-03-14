export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required.' });
    }

    // Simulate network delay to Lulu.com API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate Lulu Print API response
    const mockOrderResponse = {
        order_id: `LULU-${Math.floor(Math.random() * 1000000)}`,
        status: 'CREATED',
        product_id: productId,
        message: 'Order successfully submitted to Lulu.com Print API (Simulated).'
    };

    console.log(`[LULU MOCK API] Order placed for ${productId}:`, mockOrderResponse);

    res.status(200).json(mockOrderResponse);
}
