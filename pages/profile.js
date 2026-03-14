import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from 'next/head';
import { Package, MapPin, LogOut, ArrowLeft } from 'lucide-react';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500">Cargando perfil...</p></div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Head><title>Mi Cuenta | Códice</title></Head>
      
      {/* Navbar simplificado */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                  <button onClick={() => router.push('/')} className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
                      <ArrowLeft className="w-5 h-5 mr-2" /> Volver a la Tienda
                  </button>
                  <button onClick={() => signOut()} className="flex items-center text-slate-500 hover:text-red-600 transition-colors">
                      Cerrar Sesión <LogOut className="w-5 h-5 ml-2" />
                  </button>
              </div>
          </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center gap-6 mb-10">
            <img src={session.user.image} alt="Avatar" className="w-20 h-20 rounded-full shadow-md border-4 border-white" />
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Hola, {session.user.name}</h1>
                <p className="text-slate-500">{session.user.email}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
                <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <Package className="text-indigo-600 w-5 h-5" />
                        <h2 className="text-lg font-bold text-slate-900">Mis Pedidos Recientes</h2>
                    </div>
                    <div className="p-6">
                        {/* Pedidos falsos de prueba */}
                        <div className="space-y-4">
                            <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Orden #LULU-89211</span>
                                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">En Camino</span>
                                </div>
                                <p className="font-semibold text-slate-900">La Espada de la Luz</p>
                                <p className="text-sm text-slate-500">Comprado hace 2 días • $19.99 USD</p>
                            </div>
                            <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Orden #LULU-34902</span>
                                    <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-1 rounded-full">Entregado</span>
                                </div>
                                <p className="font-semibold text-slate-900">Don Quijote de la Mancha</p>
                                <p className="text-sm text-slate-500">Comprado el mes pasado • $24.99 USD</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <MapPin className="text-indigo-600 w-5 h-5" />
                        <h2 className="text-lg font-bold text-slate-900">Dirección Guardada</h2>
                    </div>
                    <div className="p-6">
                        <p className="font-semibold text-slate-900">{session.user.name}</p>
                        <p className="text-slate-600 text-sm mt-1">Av. Principal 123<br/>Col. Centro, CP 01000<br/>Ciudad de México, México</p>
                        <button className="text-indigo-600 text-sm font-medium mt-4 hover:underline">Editar dirección (Pronto)</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
