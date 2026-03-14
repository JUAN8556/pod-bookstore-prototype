import React, { useState } from 'react';
import Head from 'next/head';
import { ShoppingCart, BookOpen, Loader2, Star, ShieldCheck, Truck } from 'lucide-react';
import products from '../products.json';

export default function HomePage() {
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
        <div className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Head>
                <title>Códice | Ediciones Premium Bajo Demanda</title>
            </Head>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                Códice
                            </span>
                        </div>
                        <div className="hidden sm:flex space-x-8 text-sm font-medium text-slate-600">
                            <a href="#" className="hover:text-indigo-600 transition-colors">Catálogo</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">Nuestra Calidad</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">Autores</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pb-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                        Historias excepcionales, <br className="hidden sm:block" />
                        <span className="text-indigo-600">impresas solo para ti.</span>
                    </h1>
                    <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                        Ediciones premium bajo demanda. Desde clásicos atemporales hasta cómics de vanguardia, 
                        impresos con la más alta calidad y enviados directamente a tu puerta.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="#catalogo" className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md">
                            Ver Catálogo
                        </a>
                    </div>
                </div>
            </section>

            {/* Features/Trust Section */}
            <section className="bg-slate-50 py-12 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
                        <div className="flex flex-col items-center p-4">
                            <Star className="h-8 w-8 text-amber-400 mb-3" />
                            <h3 className="font-semibold text-slate-900">Calidad Premium</h3>
                            <p className="text-sm text-slate-600 mt-1">Papel de alto gramaje y encuadernación duradera.</p>
                        </div>
                        <div className="flex flex-col items-center p-4">
                            <Truck className="h-8 w-8 text-indigo-500 mb-3" />
                            <h3 className="font-semibold text-slate-900">Envío Global</h3>
                            <p className="text-sm text-slate-600 mt-1">Impresión local para entregas rápidas en todo el mundo.</p>
                        </div>
                        <div className="flex flex-col items-center p-4">
                            <ShieldCheck className="h-8 w-8 text-emerald-500 mb-3" />
                            <h3 className="font-semibold text-slate-900">Pago Seguro</h3>
                            <p className="text-sm text-slate-600 mt-1">Transacciones encriptadas de extremo a extremo.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Catalog */}
            <section id="catalogo" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900">Selección Destacada</h2>
                        <div className="w-24 h-1 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {products.map(product => (
                            <div key={product.id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="aspect-[3/4] w-full bg-slate-100 overflow-hidden relative p-8 flex items-center justify-center">
                                    <img 
                                        src={product.image_url} 
                                        alt={product.title} 
                                        className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-slate-800 shadow-sm border border-slate-200 uppercase tracking-wide">
                                            {product.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 leading-tight">{product.title}</h3>
                                            <p className="text-sm text-slate-500 mt-1">por {product.author}</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-3 line-clamp-3 flex-grow">
                                        {product.description}
                                    </p>
                                    <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-100">
                                        <span className="text-2xl font-black text-slate-900">
                                            ${(product.price_cents / 100).toFixed(2)}
                                        </span>
                                        <button 
                                            onClick={() => handleBuyClick(product.id)}
                                            disabled={loading === product.id}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading === product.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-4 h-4" />
                                                    <span>Comprar</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <BookOpen className="h-6 w-6 text-indigo-400" />
                        <span className="text-xl font-bold text-white">
                            Códice
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} Códice Print-on-Demand. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
