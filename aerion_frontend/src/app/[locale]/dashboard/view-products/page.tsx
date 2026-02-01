"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Product {
  name: string;
  price: number;
  stock: number;
  category?: string;
  stitching_type?: string;
  color?: string;
  description?: string;
  image_url?: string;
}

const BASE_URL = "http://localhost:8006";

export default function ViewProducts() {
  const tPage = useTranslations("viewProductsPage");
  const tAlerts = useTranslations("viewAlerts");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/products`);
        const data = await res.json();
        console.log(data)
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        setError(tAlerts("network_error"));
        toast.error(tAlerts("network_error"));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [tAlerts]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#010503] flex flex-col justify-center items-center z-50">
        <div className="w-16 h-16 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
        <div className="text-emerald-500 font-mono text-[10px] tracking-[0.5em] animate-pulse uppercase">
          Initializing_Catalog_Data
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010503] text-emerald-100 px-6 lg:px-12 py-12 relative overflow-hidden">
      
      {/* 🔮 Background Layers */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="mb-16 border-l-4 border-emerald-500 pl-6 py-2">
      

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="font-black text-2xl sm:text-3xl tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white py-1">
              INVENTORY
            </h1>
            <div className="h-[1px] w-full bg-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] font-mono text-emerald-500/60 mt-2 tracking-[0.2em] uppercase">
              Aerion_OS // Resource Deployment View
            </span>
          </motion.div>
        </header>

        {products.length === 0 ? (
          <div className="text-center py-40 border border-dashed border-emerald-900/20">
            <p className="text-xs font-mono text-emerald-900 tracking-[0.3em] uppercase italic">Zero Assets Found In Database</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {products.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-black/40 border border-emerald-900/20 rounded-sm p-4 hover:border-emerald-500/50 transition-all duration-300"
                >
                  {/* Visual ID Tag */}
                  <div className="absolute top-0 right-0 bg-emerald-500/10 px-2 py-1 text-[8px] font-mono text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    ID_{i.toString().padStart(3, '0')}
                  </div>

                  {/* ⭐ PRODUCT IMAGE CONTAINER */}
                  <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-black flex items-center justify-center border border-white/5 mb-4 group-hover:border-emerald-500/30 transition-all">
                    <img
                      src={p.image_url || "/placeholder.png"}
                      alt={p.name}
                      className="h-full w-full object-contain p-2 transition duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                  </div>

                  {/* DATA SECTION */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold tracking-wider text-white uppercase line-clamp-1 group-hover:text-emerald-400">
                      {p.name}
                    </h3>
                    
                    <div className="flex justify-between items-end border-t border-white/5 pt-3">
                      <div className="space-y-1">
                        <p className="text-[8px] text-emerald-900 font-mono uppercase tracking-tighter">Current_Valuation</p>
                        <p className="text-xl font-black text-emerald-500 leading-none">
                          ${p.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-emerald-900 font-mono uppercase tracking-tighter">Stock_Level</p>
                        <p className={`text-xs font-mono font-bold ${p.stock < 10 ? 'text-red-500' : 'text-white'}`}>
                          {p.stock.toString().padStart(2, '0')} UNITS
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* FOOTER STATS */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4 text-[9px] font-mono text-emerald-900 uppercase tracking-widest">
          <div className="flex gap-6">
            <span>Total_Assets: {products.length}</span>
            <span>System_Health: Stable</span>
          </div>
          <span>Refreshed: {new Date().toLocaleTimeString()}</span>
        </footer>
      </div>
    </div>
  );
}