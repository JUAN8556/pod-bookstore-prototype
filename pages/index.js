import React, { useState } from 'react';
import products from '../products.json';

const HomePage = () => {
    const [loading, setLoading] = useState(null);

    const handleBuyClick = async (productId) => {
        setLoading(productId);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: productId, quantity: 1 }),
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
            }

            const { url } = await response.json();
            window.location.href = url;

        } catch (error) {
            console.error("Failed to create Stripe session:", error);
            alert(`Error: ${error.message}`);
            setLoading(null);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">Nuestra Colección</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <img src={product.image_url} alt={product.title} className="w-full h-64 object-contain p-4" />
                            <div className="p-6 text-center">
                                <h2 className="text-2xl font-bold text-gray-800">{product.title}</h2>
                                <p className="text-md text-gray-600 mt-1">por {product.author}</p>
                                <p className="text-xl font-semibold text-gray-900 mt-4">
                                    $S{(product.price_cents / 100).toFixed(2)}
                                </p>
                                <button 
                                    onClick={() => handleBuyClick(product.id)}
                                    disabled={loading === product.id}
                                    className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 transition-colors"
                                >
                                    {loading === product.id ? 'Procesando...' : 'Comprar Ahora'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
