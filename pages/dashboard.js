import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("libros");

  // Mocks temporales antes de conectar Prisma real
  const mockBooks = [
    {
      id: 1,
      title: "La Espada de la Luz",
      sales: 124,
      price: 24.99,
      status: "Activo",
    },
    { id: 2, title: "Resurrección", sales: 89, price: 19.99, status: "Activo" },
  ];

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p>Cargando panel...</p>
      </div>
    );

  // Si no hay sesión (en producción real), redirigir a login. Por ahora lo mostramos para la maqueta.
  // if (status === 'unauthenticated') { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <Head>
        <title>Panel de Autor | Códice</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      {/* Sidebar (Navegación Lateral) */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col md:min-h-screen border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <span className="text-xl font-bold tracking-tight">Códice Autor</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab("libros")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "libros" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <BookOpen className="w-5 h-5" /> Mis Libros
          </button>
          <button
            onClick={() => setActiveTab("finanzas")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "finanzas" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <DollarSign className="w-5 h-5" /> Ventas y Ganancias
          </button>
          <button
            onClick={() => setActiveTab("pagos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "pagos" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Settings className="w-5 h-5" /> Cuenta de Pagos
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
              {session?.user?.name ? session.user.name.charAt(0) : "A"}
            </div>
            <div className="text-sm truncate">
              <p className="font-medium text-white truncate">
                {session?.user?.name || "Autor Prueba"}
              </p>
              <p className="text-slate-400 text-xs truncate">
                {session?.user?.email || "autor@ejemplo.com"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content (Contenido Principal) */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Vista: Mis Libros */}
        {activeTab === "libros" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Catálogo de Obras
                </h1>
                <p className="text-slate-500 mt-1">
                  Sube y administra los libros que tienes a la venta.
                </p>
              </div>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                <Plus className="w-5 h-5" /> Nuevo Libro
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Título</th>
                    <th className="px-6 py-4">Precio Público</th>
                    <th className="px-6 py-4">Ventas</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockBooks.map((book) => (
                    <tr
                      key={book.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        ${book.price}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {book.sales} uds.
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {book.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {mockBooks.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p>Aún no has publicado ningún libro.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vista: Pagos (Stripe Connect) */}
        {activeTab === "pagos" && (
          <div className="animate-in fade-in duration-300 max-w-3xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                Configuración de Pagos
              </h1>
              <p className="text-slate-500 mt-1">
                Conecta tu cuenta bancaria para recibir las ganancias de tus
                ventas automáticamente.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Recibe tus regalías directo a tu banco
              </h2>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                Códice utiliza <strong>Stripe Connect</strong> para depositar de
                forma segura y automática la ganancia neta de cada uno de tus
                libros directamente en tu cuenta bancaria.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 flex items-start gap-3 text-sm text-left mb-8 max-w-lg mx-auto">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Actualmente tu cuenta no está conectada a Stripe. No podrás
                  publicar libros hasta que habilites la recepción de pagos.
                </p>
              </div>

              <button className="inline-flex items-center gap-2 bg-[#635BFF] hover:bg-[#4B45C6] text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-sm">
                <LinkIcon className="w-5 h-5" /> Conectar con Stripe
              </button>
            </div>
          </div>
        )}

        {/* Vista: Finanzas */}
        {activeTab === "finanzas" && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                Resumen Financiero
              </h1>
              <p className="text-slate-500 mt-1">
                Tus métricas de ventas y regalías acumuladas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Ganancias Disponibles
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  $0.00{" "}
                  <span className="text-sm text-slate-500 font-normal">
                    USD
                  </span>
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Ventas Totales (Mes)
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  0{" "}
                  <span className="text-sm text-slate-500 font-normal">
                    libros
                  </span>
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Próximo Depósito
                </p>
                <p className="text-3xl font-bold text-slate-900">-</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
              <p className="text-slate-500">
                Conecta tu cuenta de Stripe primero para ver tu historial de
                transacciones.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
