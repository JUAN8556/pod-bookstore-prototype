import React, { useState } from "react";
import Head from "next/head";
import {
  ShoppingCart,
  BookOpen,
  Loader2,
  Star,
  ShieldCheck,
  Truck,
  X,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import prisma from '../lib/prisma'; // Added prisma

export async function getServerSideProps() {
  try {
    // Fetch live books directly from Supabase via Prisma!
    const books = await prisma.book.findMany({
      where: { isActive: true },
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      }
    });

    const formattedBooks = books.map(book => ({
      id: book.id,
      type: "Libro",
      title: book.title,
      author: book.vendor?.storeName || book.vendor?.user?.name || "Autor Independiente",
      description: book.description || "Sin descripción disponible.",
      price_cents: Number(book.retailPrice) * 100, // Prisma returns Decimal, we need cents for Stripe
      image_url: book.coverUrl || "https://via.placeholder.com/400x600.png?text=Portada+No+Disponible",
      connected_account_id: book.vendor?.stripeAccountId || null
    }));

    return {
      props: {
        products: formattedBooks
      }
    };
  } catch (error) {
    console.error("Database fetch error:", error);
    return {
      props: {
        products: []
      }
    };
  }
}

export default function HomePage({ products }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "Mexico",
  });

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(selectedProduct.id);

    try {
      // Updated to process charges using Destination Charge (Checkout Session API)
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productName: selectedProduct.title,
          priceInCents: selectedProduct.price_cents,
          connectedAccountId:
            selectedProduct.connected_account_id || "acct_invalid_mock", // Fallback
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          errorBody.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();

      // Redirect to Stripe Hosted Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to process order via Destination Charge:", error);
      alert(`Error procesando checkout en Stripe: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Head>
        <title>Códice | Ediciones Premium Bajo Demanda</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      {/* Modal de Checkout (Simulado) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">
                Datos de Envío
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitOrder} className="p-6">
              <div className="mb-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex gap-4">
                <img
                  src={selectedProduct?.image_url}
                  alt={selectedProduct?.title}
                  className="w-16 h-24 object-cover rounded shadow-sm"
                />
                <div>
                  <p className="font-semibold text-slate-900 line-clamp-1">
                    {selectedProduct?.title}
                  </p>
                  <p className="text-indigo-600 font-bold mt-1">
                    ${(selectedProduct?.price_cents / 100).toFixed(2)} USD
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dirección (Calle y Número)
                    </label>
                    <input
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                      placeholder="Av. Principal 123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                      placeholder="CDMX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Código Postal
                    </label>
                    <input
                      required
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                      placeholder="01000"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading === selectedProduct?.id}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70"
                >
                  {loading === selectedProduct?.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Confirmar Orden</>
                  )}
                </button>
                <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Sus datos están seguros. Simulación de pago activo.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <div className="flex items-center space-x-4 sm:space-x-8 text-sm font-medium text-slate-600">
              <a
                href="#catalogo"
                className="hover:text-indigo-600 transition-colors"
              >
                Catálogo
              </a>
              <a
                href="#"
                className="hidden sm:inline hover:text-indigo-600 transition-colors"
              >
                Autores
              </a>
              {session ? (
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-1 sm:gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                >
                  <User className="w-4 h-4" />{" "}
                  <span className="hidden sm:inline">Mi Cuenta</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-1 sm:gap-2 text-slate-600 font-bold hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4" />{" "}
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )}
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
            Ediciones premium bajo demanda. Desde clásicos atemporales hasta
            cómics de vanguardia, impresos con la más alta calidad y enviados
            directamente a tu puerta.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="#catalogo"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md"
            >
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
              <p className="text-sm text-slate-600 mt-1">
                Papel de alto gramaje y encuadernación duradera.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Truck className="h-8 w-8 text-indigo-500 mb-3" />
              <h3 className="font-semibold text-slate-900">Envío Global</h3>
              <p className="text-sm text-slate-600 mt-1">
                Impresión local para entregas rápidas en todo el mundo.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <ShieldCheck className="h-8 w-8 text-emerald-500 mb-3" />
              <h3 className="font-semibold text-slate-900">Pago Seguro</h3>
              <p className="text-sm text-slate-600 mt-1">
                Transacciones encriptadas de extremo a extremo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Author Showcase Section */}
      <section className="py-20 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">
                Autor Destacado
              </span>
              <h2 className="text-4xl font-extrabold mt-2 mb-6 text-white">
                Delfino Rene Garcia Vazquez
              </h2>
              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                Maestro de la fantasía épica contemporánea. Con su aclamada saga{" "}
                <strong>"La Espada de la Luz"</strong>, Delfino ha cautivado a
                miles de lectores sumergiéndolos en una batalla ancestral entre
                ángeles y demonios, donde la humanidad es el campo de batalla y
                la última esperanza de redención.
              </p>
              <p className="text-slate-400 mb-8">
                Sus obras, "El Libro de la Noche" y "Resurrección", destacan por
                su rica mitología, personajes complejos y una narrativa vibrante
                que no da tregua desde la primera página. Descubre el universo
                que ha redefinido la fantasía hispana.
              </p>
              <div className="flex gap-4">
                <a
                  href="#catalogo"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-slate-900 bg-white hover:bg-slate-100 transition-colors"
                >
                  Ver sus obras
                </a>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center relative">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-20 rounded-full"></div>
              <div className="relative grid grid-cols-2 gap-4 transform lg:rotate-3">
                <img
                  src="https://books.google.com/books/content?id=soSqDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
                  alt="La Espada De La Luz: El Libro De La Noche"
                  className="rounded-xl shadow-2xl shadow-indigo-500/20 border border-slate-700 hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://books.google.com/books/content?id=qfCFDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
                  alt="La Espada De La Luz: Resurrección"
                  className="rounded-xl shadow-2xl shadow-purple-500/20 border border-slate-700 transform translate-y-8 hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <section id="catalogo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Selección Destacada
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
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
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        {product.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        por {product.author}
                      </p>
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
                      onClick={() => handleBuyClick(product)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Comprar</span>
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
            <span className="text-xl font-bold text-white">Códice</span>
          </div>
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Códice Print-on-Demand. Todos los
            derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
