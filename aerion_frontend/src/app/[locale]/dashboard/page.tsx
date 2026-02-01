"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

/* ================= TYPES (Same as before) ================= */
interface MachineRisk { machine_id: string; machine_name: string; stage: string; risk: string; reasons: string[]; temperature: number; vibration: number; status: string; }
interface InventoryRisk { product: string; stock: number; risk: string; reason: string; }
interface SupplierRisk { supplier: string; risk: string; reason: string; phone: string; }
interface IndustryReport { machines: MachineRisk[]; inventory: InventoryRisk[]; suppliers: SupplierRisk[]; }

export default function IndustryRiskDashboardPro() {
  const [report, setReport] = useState<IndustryReport | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://127.0.0.1:8004/industry/analysis-report", { cache: "no-store" });
      const json = await res.json();
      const parsed = typeof json.report === "string" ? JSON.parse(json.report) : json.report;
      setReport(parsed);
      setUpdatedAt(new Date().toLocaleTimeString());
    };
    load();
  }, []);

  if (!report) {
    return (
      <div className="min-h-screen bg-[#010503] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-emerald-500 font-mono tracking-widest animate-pulse uppercase text-xs">Synchronizing Neural Data...</p>
      </div>
    );
  }

  // Analytics Colors (As requested, keeping chart colors the same)
  const CHART_COLORS = ["#ef4444", "#f97316", "#ec4899"];

  return (
    <div className="min-h-screen bg-[#010503] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* 🌌 BACKGROUND ACCENTS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-black text-3xl sm:text-4xl tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white py-2">
              AERION ANALYTICS
            </h1>
            <div className="h-[1px] w-full bg-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
            <p className="text-[10px] font-mono text-emerald-500/60 mt-3 tracking-[0.4em] uppercase">Enterprise Risk Intelligence Network</p>
          </motion.div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded font-mono text-[10px] tracking-widest text-emerald-400">
            SYSTEM_TIME: {updatedAt} // STATUS: ACTIVE
          </div>
        </div>

        {/* KPI SECTION (Emerald Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <KPICard title="TOTAL_ASSETS" value={report.machines.length} sub="Monitored Units" />
          <KPICard title="HIGH_RISK_ALERTS" value={report.machines.filter(m => m.risk === "HIGH").length} sub="Immediate Action" isAlert />
          <KPICard title="INVENTORY_RECOVERY" value={report.inventory.length} sub="Restock Required" />
          <KPICard title="SUPPLY_CHAIN" value={report.suppliers.length} sub="Verified Vendors" />
        </div>

        {/* CHARTS GRID */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          
          <ChartPanel title="RISK_DISTRIBUTION">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={[
                    { name: "Machines", value: report.machines.length },
                    { name: "Inventory", value: report.inventory.length },
                    { name: "Suppliers", value: report.suppliers.length }
                  ]} 
                  innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                >
                  {CHART_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid #10b981", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-[10px] font-mono text-gray-500">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#ef4444]" /> MACHINES</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#f97316]" /> INV</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#ec4899]" /> SUPP</span>
            </div>
          </ChartPanel>

          <ChartPanel title="SENSOR_STRESS_INDEX">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={report.machines.map(m => ({ id: m.machine_id, t: m.temperature, v: m.vibration }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="id" stroke="#333" fontSize={10} />
                <YAxis stroke="#333" fontSize={10} />
                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: "#000", border: "1px solid #10b981" }} />
                <Bar dataKey="t" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="v" fill="#fb7185" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="STOCK_THRESHOLD">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={report.inventory.map(i => ({ name: i.product.slice(0,5), s: i.stock }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#333" fontSize={10} />
                <YAxis stroke="#333" fontSize={10} />
                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: "#000", border: "1px solid #10b981" }} />
                <Bar dataKey="s" fill="#f97316" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

        </div>

        {/* TABLES SECTION */}
        <div className="space-y-16">
          <IndustrialTable 
            title="MACHINE_LOGS" 
            headers={["ID", "ASSET_NAME", "STAGE", "TEMP", "VIB", "STATUS", "RISK_LEVEL"]}
            rows={report.machines.map(m => [m.machine_id, m.machine_name, m.stage, `${m.temperature}°C`, m.vibration, m.status, m.risk])}
          />

          <div className="grid md:grid-cols-2 gap-8">
            <IndustrialTable 
              title="INVENTORY_ALERTS" 
              headers={["PRODUCT", "STOCK", "STATUS"]}
              rows={report.inventory.map(i => [i.product, i.stock, i.risk])}
            />
            <IndustrialTable 
              title="SUPPLY_CHAIN_RISK" 
              headers={["VENDOR", "CONTACT", "RISK"]}
              rows={report.suppliers.map(s => [s.supplier, s.phone, s.risk])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT MODULES ================= */

function KPICard({ title, value, sub, isAlert }: any) {
  return (
    <div className="bg-white/5 border border-emerald-500/10 p-6 rounded-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
      <div className="absolute top-0 left-0 w-[2px] h-0 bg-emerald-500 group-hover:h-full transition-all duration-500" />
      <p className="text-[10px] font-mono tracking-[0.2em] text-emerald-500/60 mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-4xl font-light ${isAlert && value > 0 ? 'text-red-500' : 'text-white'}`}>{value}</h3>
        {isAlert && value > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />}
      </div>
      <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-2">{sub}</p>
    </div>
  );
}

function ChartPanel({ title, children }: any) {
  return (
    <div className="bg-black/40 border border-white/5 p-6 rounded-sm relative shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45" />
        <h3 className="text-xs font-mono tracking-[0.3em] text-emerald-500 uppercase">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function IndustrialTable({ title, headers, rows }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-black tracking-[0.4em] text-white uppercase">{title}</h2>
        <div className="h-[1px] flex-grow bg-emerald-500/20" />
      </div>
      <div className="overflow-x-auto border border-white/5 bg-black/20 backdrop-blur-sm rounded-sm">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="border-b border-emerald-500/20 bg-emerald-500/5">
              {headers.map((h: string, i: number) => (
                <th key={i} className="px-6 py-4 text-left text-emerald-500 tracking-widest font-light">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any[], i: number) => (
              <tr key={i} className="border-b border-white/5 hover:bg-emerald-500/5 transition-colors group">
                {row.map((cell: any, j: number) => (
                  <td key={j} className={`px-6 py-4 tracking-wider ${
                    cell === "HIGH" ? "text-red-500 font-bold" : 
                    cell === "OVER" ? "text-orange-400" : "text-gray-400 group-hover:text-emerald-100"
                  }`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}