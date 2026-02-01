"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:8004";

/* ---------------- INTERFACES ---------------- */
interface Item {
  product: string;
  stock: number;
  supplier: string;
  phone: string;
}

interface InventoryReport {
  low_stock: Item[];
  over_stock: Item[];
  checked_at: string;
}

export default function InventoryPage() {
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchReport() {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/inventory/report`, { cache: "no-store" });
      const data = await res.json();
      const parsed = typeof data.report === "string" ? JSON.parse(data.report) : data.report;
      setReport(parsed);
    } catch (err) {
      toast.error("Neural Link Severed: System Offline");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReport(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010503] flex flex-col items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full" />
          <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-emerald-500 font-mono text-[10px] tracking-[0.5em] animate-pulse">QUANTIZING_INVENTORY_DATA</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010503] text-emerald-100 p-4 md:p-10 selection:bg-emerald-500/30">
      
      {/* 🔮 BG GLOW */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto">
        
        {/* TOP NAV/HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 border-l-4 border-emerald-500 pl-6 py-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              STOCK_<span className="text-emerald-500">CONTROL</span>
            </h1>
            <p className="text-[10px] font-mono text-emerald-700 tracking-[0.3em] uppercase mt-2">Aerion Intelligence Manufacturing Systems</p>
          </div>
          <div className="mt-6 lg:mt-0 flex gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-mono text-emerald-900 uppercase">System Status</p>
              <p className="text-xs text-emerald-400 font-mono">ENCRYPTED_LINK_ACTIVE</p>
            </div>
            <button 
              onClick={fetchReport}
              className="px-8 py-3 bg-emerald-500 text-black font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all duration-300"
            >
              Force Sync
            </button>
          </div>
        </header>

        {/* SUMMARY KPI TILES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <KPITile label="CRITICAL_ITEMS" value={report?.low_stock.length || 0} color="red" />
          <KPITile label="SURPLUS_ASSETS" value={report?.over_stock.length || 0} color="emerald" />
          <KPITile label="LAST_CHECK" value={new Date(report?.checked_at || "").toLocaleTimeString()} color="gray" />
        </div>

        {/* MAIN DATA GRID */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: LOW STOCK (More focus as it is critical) */}
          <div className="lg:col-span-7">
            <PanelHeader title="CRITICAL_DEPLETION_ALERTS" count={report?.low_stock.length} color="red" />
            <div className="grid gap-4">
              <AnimatePresence>
                {report?.low_stock.map((item, idx) => (
                  <InventoryDetailCard key={idx} item={item} status="CRITICAL" />
                ))}
              </AnimatePresence>
              {report?.low_stock.length === 0 && <EmptyState />}
            </div>
          </div>

          {/* RIGHT: OVER STOCK */}
          <div className="lg:col-span-5">
            <PanelHeader title="SURPLUS_STORAGE_LOG" count={report?.over_stock.length} color="emerald" />
            <div className="grid gap-4 opacity-80 hover:opacity-100 transition-opacity">
              {report?.over_stock.map((item, idx) => (
                <InventoryDetailCard key={idx} item={item} status="SURPLUS" />
              ))}
              {report?.over_stock.length === 0 && <EmptyState />}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

/* ---------------- REUSABLE COMPONENTS ---------------- */

function KPITile({ label, value, color }: any) {
  const colorMap: any = {
    red: "border-red-500 text-red-500 bg-red-500/5",
    emerald: "border-emerald-500 text-emerald-500 bg-emerald-500/5",
    gray: "border-emerald-900/30 text-emerald-900 bg-emerald-900/5",
  };

  return (
    <div className={`p-8 border-t-2 ${colorMap[color]} backdrop-blur-md`}>
      <p className="text-[10px] font-mono tracking-[0.2em] mb-2">{label}</p>
      <h3 className="text-4xl font-black">{value}</h3>
    </div>
  );
}

function PanelHeader({ title, count, color }: any) {
  const isRed = color === "red";
  return (
    <div className={`flex items-center justify-between mb-6 p-4 bg-gradient-to-r ${isRed ? 'from-red-500/20' : 'from-emerald-500/20'} to-transparent border-l-2 ${isRed ? 'border-red-500' : 'border-emerald-500'}`}>
      <span className="text-[11px] font-black tracking-widest uppercase">{title}</span>
      <span className="text-xs font-mono">VOL_{count}</span>
    </div>
  );
}

function InventoryDetailCard({ item, status }: { item: Item; status: "CRITICAL" | "SURPLUS" }) {
  const isCritical = status === "CRITICAL";
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }}
      className="group relative bg-[#020a06] border border-emerald-900/20 p-6 hover:border-emerald-500/50 transition-all overflow-hidden"
    >
      {/* Visual background indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${isCritical ? 'bg-red-600' : 'bg-emerald-600'}`} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">{item.product}</h4>
            <span className={`text-[8px] px-2 py-0.5 font-black border ${isCritical ? 'border-red-500 text-red-500' : 'border-emerald-500 text-emerald-500'}`}>
              {status}
            </span>
          </div>
          <div className="flex gap-6 mt-3 text-[10px] font-mono text-emerald-900 uppercase">
            <p><span className="text-emerald-700">Vendor:</span> {item.supplier}</p>
            <p><span className="text-emerald-700">Secure_Line:</span> {item.phone}</p>
          </div>
        </div>

        <div className="w-full sm:w-32 text-right">
          <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: isCritical ? "20%" : "85%" }} 
              className={`absolute h-full ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`} 
            />
          </div>
          <p className={`text-2xl font-black font-mono ${isCritical ? 'text-red-500' : 'text-emerald-400'}`}>
            {item.stock}
          </p>
          <p className="text-[8px] font-mono text-emerald-900 uppercase tracking-tighter">Units_In_Grid</p>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center border border-dashed border-emerald-900/20">
      <div className="w-2 h-2 bg-emerald-500 mx-auto mb-4 rotate-45 animate-ping" />
      <p className="text-[10px] font-mono text-emerald-900 uppercase tracking-[0.3em]">No Discrepancies Detected In Sector</p>
    </div>
  );
}