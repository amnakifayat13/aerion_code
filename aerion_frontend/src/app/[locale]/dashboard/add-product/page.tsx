"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";

export default function AddProduct() {
  const t = useTranslations("addProductPage");
  const tAlerts = useTranslations("alerts");
  const locale = useLocale();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    aircraft_system: "",
    color: "",
    description: "",
    image: null as File | null,
  });

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image) {
      toast.error(tAlerts("required_fields"));
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) {
        if (key === "image" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    try {
      setLoading(true);
      toast.loading(t("loading_upload"), { id: "upload" });
      const res = await fetch(`${BASE_URL}/products`, { method: "POST", body: formData });
      const data = await res.json();
      toast.dismiss("upload");

      if (res.ok) {
        toast.success(tAlerts("upload_success"));
        setForm({ name: "", price: "", stock: "", category: "", aircraft_system: "", color: "", description: "", image: null });
      } else {
        toast.error(`${data.detail || tAlerts("upload_fail")}`);
      }
    } catch {
      toast.dismiss("upload");
      toast.error(tAlerts("network_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010503] flex items-center justify-center p-4 sm:p-10 relative overflow-hidden">
      
      {/* 🌌 Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-black/40 backdrop-blur-xl border border-emerald-500/20 rounded-sm p-6 sm:p-10 shadow-2xl"
      >
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500" />

        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-black tracking-[0.2em] text-white uppercase italic">
            ASSET_<span className="text-emerald-500">REGISTRATION</span>
          </h2>
          <div className="h-[2px] w-24 bg-emerald-500 mt-2" />
          <p className="text-[10px] font-mono text-emerald-700 tracking-[0.4em] uppercase mt-4">
            Industrial Resource Management Interface
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Product Name */}
          <div className="group">
            <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-2 block">Item_Identification</label>
            <input
              className="w-full bg-emerald-950/20 text-white border border-emerald-900/50 focus:border-emerald-400 focus:outline-none p-4 rounded-sm font-mono text-sm transition-all"
              placeholder="ENTER PRODUCT NAME..."
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-2 block">Valuation_USD</label>
              <input
                type="number"
                className="w-full bg-emerald-950/20 text-white border border-emerald-900/50 focus:border-emerald-400 focus:outline-none p-4 rounded-sm font-mono text-sm"
                placeholder="0.00"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            {/* Stock */}
            <div>
              <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-2 block">Unit_Quantity</label>
              <input
                type="number"
                className="w-full bg-emerald-950/20 text-white border border-emerald-900/50 focus:border-emerald-400 focus:outline-none p-4 rounded-sm font-mono text-sm"
                placeholder="QUANTITY"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-2 block">System_Classification</label>
            <select
              value={form.aircraft_system}
              onChange={(e) => setForm({ ...form, aircraft_system: e.target.value })}
              className="w-full bg-emerald-950/20 text-white border border-emerald-900/50 focus:border-emerald-400 focus:outline-none p-4 rounded-sm font-mono text-sm appearance-none cursor-pointer"
            >
              <option value="" className="bg-black">SELECT CAR PRODUCT SYSTEM</option>
              <option value="Steel Sheet 1mm (Car Body Panels)" className="bg-black">Steel Sheet 1mm (Car Body Panels)</option>
              <option value="Aluminum Alloy Sheet" className="bg-black">Aluminum Alloy Sheet (Engine / Lightweight)</option>
              <option value="ABS Plastic Dashboard Panel" className="bg-black">ABS Plastic Dashboard Panel</option>
              <option value="Polyurethane Foam" className="bg-black">Polyurethane Foam Car Seat Cushion</option>
              <option value="Rubber Tire Tube" className="bg-black">Rubber Tire Tube / Hose</option>
              <option value="Wiring Harness" className="bg-black">Wiring Harness for Car</option>
              <option value="Engine Sensor Module" className="bg-black">Car Engine Sensor Module</option>
              <option value="Bolt & Nut Set" className="bg-black">Bolt & Nut Set (Chassis Assembly)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-2 block">Technical_Specifications</label>
            <textarea
              rows={3}
              placeholder="ENTER COMPONENT DESCRIPTION..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-emerald-950/20 text-white border border-emerald-900/50 focus:border-emerald-400 focus:outline-none p-4 rounded-sm font-mono text-sm resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="relative border-2 border-dashed border-emerald-900/30 p-6 text-center hover:border-emerald-500/50 transition-colors">
            <input
              type="file"
              required
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <p className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest">
              {form.image ? `FILE: ${form.image.name}` : "DRAG_OR_UPLOAD_ASSET_SCHEMATIC"}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-sm text-black font-black text-xs tracking-[0.5em] uppercase transition-all duration-500 ${
              loading ? "bg-emerald-900 cursor-not-allowed text-emerald-500" : "bg-emerald-500 hover:bg-white"
            }`}
          >
            {loading ? (
              <span className="animate-pulse">PROCESS_UPLOAD_INITIALIZING...</span>
            ) : (
              "EXECUTE_REGISTRATION"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}