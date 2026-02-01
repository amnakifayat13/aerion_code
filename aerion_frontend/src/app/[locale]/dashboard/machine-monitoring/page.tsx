"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function MachineMonitoringDashboard() {
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendToAI() {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8004/factory/orchestrator-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();
      setAiResponse(data.response);
    } catch (e) {
      toast.error("Neural Link Failure: AI Core Unreachable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#010503] text-emerald-100 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      
      {/* 🌌 Background Decoration (Matches MainPage) */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 sm:p-10">
        
        {/* ===== TOP HUD (Matches Aerion Title Style) ===== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="font-black text-2xl sm:text-3xl tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white py-1">
              ORCHESTRATOR
            </h1>
            <div className="h-[1px] w-full bg-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] font-mono text-emerald-500/60 mt-2 tracking-[0.2em] uppercase">
              Machine Diagnostics Unit
            </span>
          </motion.div>

          <div className="flex flex-wrap gap-3">
            <StatusLight label="SYSTEM" status="active" />
            <StatusLight label="AI CORE" status="active" />
            <StatusLight label="NEURAL LINK" status="standby" />
          </div>
        </div>

        {/* ===== CONTROL INTERFACE ===== */}
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Input Side */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white/5 border border-emerald-500/20 p-8 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-500" />
              </div>

              <h2 className="text-xl font-light tracking-widest text-emerald-400 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-500 rotate-45 animate-pulse" />
                COMMAND INPUT
              </h2>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query system for machine anomalies..."
                className="w-full bg-black/40 border border-emerald-500/20 rounded-xl p-4 text-emerald-100 placeholder:text-emerald-900 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono text-sm resize-none"
                rows={5}
              />

              <motion.button
                onClick={sendToAI}
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 font-mono tracking-[0.3em] uppercase text-xs hover:bg-emerald-500 hover:text-black transition-all duration-300 overflow-hidden relative group"
              >
                <span className="relative z-10">{loading ? "PROCESSING..." : "RUN DIAGNOSTIC"}</span>
              </motion.button>
            </div>

            <div className="px-4 py-3 border-l-2 border-emerald-500/30 text-[11px] text-emerald-700 font-mono uppercase leading-relaxed">
              System protocol: Query overheating, vibration, or maintenance schedules for real-time analysis.
            </div>
          </motion.div>

          {/* Response Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="h-full min-h-[400px] bg-black/40 border border-white/5 rounded-2xl p-8 relative overflow-hidden">
              {/* Subtle Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-mono tracking-widest text-emerald-600 uppercase">Analysis Terminal</h3>
                {loading && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
              </div>

              <div className="font-mono text-sm leading-relaxed text-emerald-200/90 whitespace-pre-wrap">
                <AnimatePresence mode="wait">
                  {aiResponse ? (
                    <motion.div
                      key="response"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-emerald-500 mr-2">{">"}</span>
                      {aiResponse}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 0.4 }}
                      className="flex flex-col items-center justify-center h-64 text-center italic"
                    >
                      <p>System Idle... Waiting for Query Transmission</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ===== ENHANCED STATUS LIGHT ===== */

function StatusLight({ label, status }: { label: string; status: "active" | "standby" | "alert" }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 border border-emerald-500/10 rounded-sm backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <span className={`absolute w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'} animate-ping opacity-75`} />
        <span className={`relative w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-yellow-600'}`} />
      </div>
      <span className="text-[10px] font-mono tracking-widest text-emerald-400/80 uppercase">{label}</span>
    </div>
  );
}