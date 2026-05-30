"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getEndpoint, safeJson } from "../../services/api";

export interface Provider {
  name: string;
  balance: string;
  balanceNum: number;
  maxBalance: number;
  color: string;
  status: "ONLINE" | "OFFLINE";
}

interface DashboardContextType {
  isSoundOn: boolean;
  setIsSoundOn: (val: boolean) => void;
  playBeep: (frequency?: number, type?: OscillatorType, duration?: number) => void;
  currentTime: string;
  handleLogout: () => void;
  providers: Provider[];
  toggleProvider: (name: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  const [providers, setProviders] = useState<Provider[]>([
    { name: "DIGIFLAZZ", balance: "Rp 15.980.100", balanceNum: 15980100, maxBalance: 20000000, color: "#78BFE4", status: "ONLINE" },
    { name: "VIP RESELLER", balance: "Rp 13.456.800", balanceNum: 13456800, maxBalance: 20000000, color: "#FDCC4E", status: "ONLINE" },
    { name: "APIGAMES", balance: "Rp 15.798.600", balanceNum: 15798600, maxBalance: 20000000, color: "#B1D99D", status: "ONLINE" },
    { name: "LAPAKPULSA", balance: "Rp 16.183.700", balanceNum: 16183700, maxBalance: 20000000, color: "#BF2D32", status: "ONLINE" },
    { name: "UNIPIN", balance: "Rp 9.177.500", balanceNum: 9177500, maxBalance: 20000000, color: "#164576", status: "ONLINE" },
  ]);

  const playBeep = (frequency = 150, type: OscillatorType = "sine", duration = 0.08) => {
    if (!isSoundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
          " " +
          now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    playBeep(150, "sawtooth", 0.2);
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const response = await fetch(getEndpoint("admin/logout"), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        await safeJson(response);
      } catch (err) {
        console.error("Gagal melakukan request logout ke server:", err);
      }
    }
    localStorage.removeItem("admin_token");
    router.push("/");
  };

  const toggleProvider = (name: string) => {
    playBeep(250, "square", 0.1);
    setProviders((prev) =>
      prev.map((p) => {
        if (p.name === name) {
          const next = p.status === "ONLINE" ? "OFFLINE" : "ONLINE";
          if (next === "OFFLINE") setTimeout(() => playBeep(200, "sawtooth", 0.3), 100);
          return { ...p, status: next };
        }
        return p;
      })
    );
  };

  return (
    <DashboardContext.Provider
      value={{
        isSoundOn,
        setIsSoundOn,
        playBeep,
        currentTime,
        handleLogout,
        providers,
        toggleProvider,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
