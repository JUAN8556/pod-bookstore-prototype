import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  BookOpen,
  DollarSign,
  UploadCloud,
  Settings,
  Link as LinkIcon,
  AlertCircle,
  Plus,
} from "lucide-react";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pagos");
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState(null);

  // Product creation states
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  // [PLACEHOLDER]: Get `accountId` from query or local DB mapping.
  // Using router query for demo purposes:
  useEffect(() => {
    if (router.query.accountId) {
      setAccountId(router.query.accountId);
    }
  }, [router.query]);

  // Check the current status of onboarding via API directly
  useEffect(() => {
    if (accountId) {
      fetch(`/api/stripe/status?accountId=${accountId}`)
        .then((res) => res.json())
        .then((data) => setOnboardingStatus(data))
        .catch(console.error);
    }
  }, [accountId, router.query]);

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    try {
      // Create account + link via our V2 API integration
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email || "vendor@example.com",
          name: session?.user?.name || "Códice Author",
          accountId: accountId, // pass it if we already have it
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Save ID so we don't recreate it
      if (data.accountId) setAccountId(data.accountId);

      // Redirect to Stripe Hosted Onboarding
      window.location.href = data.url;
    } catch (e) {
      alert(`Error de Stripe: ${e.message}`);
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!accountId) return alert("Please onboard with Stripe first.");

    setCreatingProduct(true);
    try {
      // Creates product at the platform level (not connected account)
      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          priceInCents: Math.round(parseFloat(productForm.price) * 100),
          connectedAccountId: accountId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Producto creado en la plataforma! Product ID: ${data.id}`);
      setProductForm({ name: "", description: "", price: "" });
    } catch (error) {
      alert(`Error creating product: ${error.message}`);
    } finally {
      setCreatingProduct(false);
    }
  };

  if (status === "loading") return <div className="p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <Head>
        <title>Panel de Autor | Connect Demo</title>
      </Head>

      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col md:min-h-screen">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <span className="text-xl font-bold">Códice Autor</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab("pagos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "pagos" ? "bg-indigo-600" : "text-slate-400 hover:bg-slate-800"}`}
          >
            <Settings className="w-5 h-5" /> Onboarding (Connect)
          </button>
          <button
            onClick={() => setActiveTab("libros")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "libros" ? "bg-indigo-600" : "text-slate-400 hover:bg-slate-800"}`}
          >
            <BookOpen className="w-5 h-5" /> Crear Producto
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        {/* TAB: ONBOARDING */}
        {activeTab === "pagos" && (
          <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold mb-2">Configuración de Pagos</h1>
            <p className="text-slate-500 mb-8">
              Conecta tu cuenta para recibir ganancias vía Stripe Connect V2.
            </p>

            {onboardingStatus ? (
              <div className="bg-slate-50 border p-4 rounded-lg mb-6">
                <h3 className="font-bold text-slate-800 mb-2">
                  Estado de tu Cuenta:
                </h3>
                <p>
                  <strong>Account ID:</strong> {onboardingStatus.accountId}
                </p>
                <p>
                  <strong>Transferencias (Active?):</strong>{" "}
                  {onboardingStatus.readyToReceivePayments
                    ? "✅ Activas"
                    : "❌ Pendientes"}
                </p>
                <p>
                  <strong>Requisitos de Onboarding completados:</strong>{" "}
                  {onboardingStatus.onboardingComplete
                    ? "✅ Sí"
                    : "❌ No (Continúa)"}
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p>
                  Aún no has conectado una cuenta. No podrás recibir pagos ni
                  publicar productos.
                </p>
              </div>
            )}

            <button
              onClick={handleConnectStripe}
              disabled={connectingStripe}
              className="flex items-center gap-2 bg-[#635BFF] hover:bg-[#4B45C6] text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
            >
              <LinkIcon className="w-5 h-5" />
              {connectingStripe
                ? "Generando V2 Account Link..."
                : onboardingStatus
                  ? "Continuar Onboarding"
                  : "Onboard to collect payments"}
            </button>
          </div>
        )}

        {/* TAB: PRODUCTS */}
        {activeTab === "libros" && (
          <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold mb-2">
              Nuevo Producto (Platform Level)
            </h1>
            <p className="text-slate-500 mb-8">
              Crear un producto en la plataforma, mapeado a tu cuenta (ID:{" "}
              {accountId || "Ninguna"}).
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nombre del Libro
                </label>
                <input
                  required
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  className="mt-1 w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 w-full border border-slate-300 rounded-lg p-2"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Precio Público (USD)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  placeholder="25.00"
                  className="mt-1 w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <button
                type="submit"
                disabled={creatingProduct || !accountId}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {creatingProduct
                  ? "Creando producto de plataforma..."
                  : "Publicar Producto"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
