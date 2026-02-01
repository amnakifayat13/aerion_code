"use client";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

export default function MainPage({ locale }: { locale: string }) {
  const router = useRouter();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX - innerWidth / 2) / innerWidth);
    mouseY.set((clientY - innerHeight / 2) / innerHeight);
  };

  const images = ["/fashion1.jpg", "/fashion2.jpg", "/fashion3.jpg", "/fashion4.jpg", "/fashion5.jpg"];

  const x = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const y = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const rotateX = useTransform(y, [-0.5, 0.5], [-10, 10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleLoginClick = () => {
    router.push(`/${locale || "en"}/login`);
  };

  return (
    <div 
      className="relative min-h-screen flex flex-col items-center justify-center text-white bg-[#010503] overflow-hidden font-sans" 
      onMouseMove={handleMouseMove}
    >
      
      {/* 🖼️ Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg1-img.jpg"
          alt="Cybernetic Background"
          fill
          priority
          className="object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-emerald-900/20" />
      </div>

      {/* 🛠️ TOP LEFT: AERION Title (Fixed Cutting & Responsive) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 sm:top-10 sm:left-10 z-30 flex flex-col items-start"
      >
        <h1 className="font-black text-2xl sm:text-4xl tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white py-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
          AERION
        </h1>
        <div className="h-[1px] w-full bg-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      </motion.div>

      {/* 🛠️ CENTER CONTENT: Agentic Enterprise Line (Fully Responsive) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-30 text-center px-6 max-w-5xl"
      >
        <p className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-gray-400 uppercase mb-3 opacity-80">
          System Architecture Initialized
        </p>
        <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.1em] sm:tracking-[0.2em] leading-snug sm:leading-relaxed">
          Agentic Enterprise Resource & <br className="hidden sm:block" /> 
          <span className="text-white font-bold drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
            Intelligence Orchestration Network
          </span>
        </h2>
        
        {/* Responsive accent lines */}
        <div className="mt-8 flex justify-center items-center gap-3 sm:gap-6 opacity-40">
          <div className="h-[1px] w-8 sm:w-16 bg-emerald-500" />
          <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45 animate-pulse" />
          <div className="h-[1px] w-8 sm:w-16 bg-emerald-500" />
        </div>
      </motion.div>

      {/* 🎥 LOWER CONTENT: Carousel & Button */}
      <div className="relative z-20 flex flex-col items-center w-full mt-8 sm:mt-12">
        {/* Carousel Commented as requested 
          {images.concat(images).map((src, idx) => ...)}
        */}

        {/* Industrial Login Button (Responsive) */}
        <motion.button
          onClick={handleLoginClick}
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            boxShadow: "0 0 40px rgba(16, 185, 129, 0.3)" 
          }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 sm:px-12 sm:py-4 border border-emerald-500/50 text-emerald-400 font-mono tracking-[0.2em] sm:tracking-[0.4em] uppercase text-[10px] sm:text-sm backdrop-blur-md relative overflow-hidden group transition-all"
        >
          <span className="relative z-10 group-hover:text-white transition-colors">Enter Dashboard</span>
          <div className="absolute inset-0 bg-emerald-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
        </motion.button>
      </div>

      {/* 📊 HUD Status Info (Left Bottom - Hidden on very small screens for clean look) */}
      <motion.div
        className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-30 text-[8px] sm:text-[9px] font-mono text-emerald-500/60 uppercase tracking-tighter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse rounded-full shadow-[0_0_5px_emerald]" />
          Neural Link: Established
        </div>
        <div className="mt-1 opacity-50 hidden sm:block">Core: 88.2% // Style Engine: Active</div>
      </motion.div>

      <style jsx>{`
        .animate-scroll { animation: scroll 40s linear infinite; }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}