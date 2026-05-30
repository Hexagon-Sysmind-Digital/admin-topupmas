"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getEndpoint, safeJson } from "../services/api";

function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getDeviceUuid() {
  if (typeof window === "undefined") return "";
  let uuid = localStorage.getItem("device_uuid");
  if (!uuid) {
    uuid = generateUUID();
    localStorage.setItem("device_uuid", uuid);
  }
  return uuid;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isShaking, setIsShaking] = useState(false);

  // Play simulated 8-bit sound
  const playBeep = (frequency = 150, type: OscillatorType = "sine", duration = 0.08) => {
    if (!isSoundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = frequency;

      // Retro 8-bit volume envelope
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // AudioContext not allowed or not supported
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password) {
      playBeep(110.00, "sawtooth", 0.3); // Low beep for error
      setErrorMsg("Error: Semua field wajib diisi!");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    // Success Sequence
    setIsLoading(true);
    setProgress(0);
    playBeep(440.00, "triangle", 0.15);

    try {
      const response = await fetch(getEndpoint("auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          uuid: getDeviceUuid(),
        }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || data.error || "Login gagal! Silakan periksa kembali kredensial Anda.");
      }

      // Save token to localStorage for subsequent API requests
      const token = data.x_access_token || data.data?.x_access_token || data.token || data.data?.token || data.access_token || data.data?.access_token || data.data?.accessToken || data.accessToken;
      if (token) {
        localStorage.setItem("admin_token", token);
      }

      // Fast-forward progress animation to Capped 100%
      setProgress(100);
      playFanfare();

      // Auto-redirect to dashboard after fanfare (400ms)
      setTimeout(() => {
        setIsLoading(false);
        router.push("/dashboard");
      }, 400);
    } catch (err: any) {
      setIsLoading(false);
      setProgress(0);
      playBeep(110.00, "sawtooth", 0.3);
      setErrorMsg(err.message || "Koneksi ke server gagal!");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Simulate progress bar loading while API is in-flight
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            return 95; // Hold near 100% until response finishes and sets to 100% or resets to 0
          }
          const nextVal = prev + Math.floor(Math.random() * 15) + 5;
          playBeep(300 + nextVal * 4, "sine", 0.05);
          return Math.min(nextVal, 95);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const playFanfare = () => {
    if (!isSoundOn) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playBeep(freq, "square", 0.25);
      }, idx * 120);
    });
  };

  // Reset function not needed anymore as we redirect directly



  return (
    <main
      className="min-h-screen w-full relative flex flex-col justify-center items-center p-4 retro-clouds"
      style={{
        backgroundImage: "url('/assets/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Sound Toggle (Retro Speaker icon) */}
      <button
        onClick={() => {
          setIsSoundOn(!isSoundOn);
          if (!isSoundOn) {
            // Immediate tiny sound feedback
            setTimeout(() => {
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.value = 600;
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.05);
              } catch (e) { }
            }, 50);
          }
        }}
        className="absolute top-4 right-4 z-50 bg-white border-4 border-[#0f172a] p-2 hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all flex items-center justify-center cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        title={isSoundOn ? "Matikan Suara" : "Nyalakan Suara"}
      >
        <span className="material-symbols-outlined text-[#164576] font-bold text-2xl">
          {isSoundOn ? "volume_up" : "volume_off"}
        </span>
      </button>

      <div className="w-full max-w-[520px] relative z-10">

        {/* TOP BRANDING AREA */}
        <div className="flex flex-col items-center mb-6 text-center select-none">
          <div className="flex items-center gap-1.5 justify-center mb-1">
            <span className="brand-title text-4xl md:text-5xl">TOPUP</span>
            <span className="brand-badge text-2xl md:text-3xl">MAS</span>
          </div>
          <span className="font-mono text-xs font-black tracking-widest text-[#164576] bg-white/80 border-2 border-[#164576] px-3 py-1 uppercase retro-shadow">
            ⚡ Admin Control Center ⚡
          </span>
        </div>

        {/* MAIN NEUTRAL-BRUTALIST CONTAINER */}
        <div
          className={`retro-box w-full p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${isShaking ? "animate-[bounce_0.2s_infinite]" : ""
            }`}
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--surface)",
            transform: isShaking ? "translateX(4px)" : "none"
          }}
        >
          {/* Internal diagonal stripes overlay on the top border */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500"></div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">

            {/* INPUT FIELDS */}
            <div>
              <label className="retro-label" htmlFor="username-input">
                USERNAME
              </label>
              <input
                id="username-input"
                type="text"
                placeholder="Masukkan Username Admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="retro-input"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="retro-label" htmlFor="password-input">
                PASSWORD
              </label>
              <div className="relative w-full">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="retro-input"
                  style={{ paddingRight: "54px" }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    playBeep(250, "sine", 0.05);
                  }}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-4 border-[#0f172a] p-1 flex items-center justify-center cursor-pointer hover:bg-[#e4f2fa] active:translate-y-[calc(-50%+2px)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] active:translate-x-[2px]"
                  style={{
                    height: "36px",
                    width: "36px",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                  }}
                  title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                >
                  <span className="material-symbols-outlined text-[#164576] font-bold text-lg select-none">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* CHECKPOINT REMEMBER ME */}
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#164576]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-5 h-5 border-4 border-[#0f172a] rounded-none checked:bg-[#BF2D32] accent-[#BF2D32] cursor-pointer"
                />
                <span>CHECKPOINT (INGAT SAYA)</span>
              </label>
              <a href="#" className="underline hover:text-[#BF2D32] transition-colors">LUPA KUNCI?</a>
            </div>

            {/* DYNAMIC ERROR MESSAGE CONTAINER */}
            {errorMsg && (
              <div className="bg-[#fce8e9] border-4 border-[#BF2D32] text-[#BF2D32] p-3 font-mono text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#BF2D32]">
                <span className="material-symbols-outlined">warning</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SUBMIT BUTTON / PROGRESS BAR */}
            <div className="mt-2">
              {!isLoading ? (
                <button
                  type="submit"
                  className="retro-button w-full text-base font-black flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "var(--tertiary)",
                    color: "var(--on-tertiary)"
                  }}
                >
                  <span>ENTER SERVICE PORTAL</span>
                  <span className="material-symbols-outlined font-bold">login</span>
                </button>
              ) : (
                <div className="w-full border-4 border-[#0f172a] p-3 bg-[#e4f2fa] relative">
                  <div className="flex justify-between items-center mb-2 font-mono text-xs font-black text-[#164576]">
                    <span>CONNECTING TO DATASERVER...</span>
                    <span>{progress}%</span>
                  </div>
                  {/* Retro XP / Loading bar */}
                  <div className="w-full h-6 border-4 border-[#0f172a] bg-white overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#FDCC4E] to-[#B1D99D] transition-all duration-150"
                      style={{
                        width: `${progress}%`,
                        backgroundImage: "repeating-linear-gradient(45deg, #43B047, #43B047 10px, #006e19 10px, #006e19 20px)"
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

          </form>

          {/* Retro details/decorations inside the box corners */}
          <div className="absolute bottom-2 right-2 font-mono text-[9px] font-bold text-gray-400 select-none">
            v1.0.0-PRO
          </div>
          <div className="absolute bottom-2 left-2 flex gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          </div>
        </div>

        {/* BOTTOM METADATA/HELP BUTTONS */}
        <div className="flex justify-between items-center mt-4 px-2 select-none">
          <div className="flex gap-2">
            <span className="w-3 h-3 bg-[#BF2D32] border-2 border-[#0f172a]"></span>
            <span className="w-3 h-3 bg-[#FDCC4E] border-2 border-[#0f172a]"></span>
            <span className="w-3 h-3 bg-[#B1D99D] border-2 border-[#0f172a]"></span>
          </div>
          <a
            href="https://topupmas.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playBeep(200, "sine", 0.05)}
            className="font-mono text-[10px] font-black text-[#164576] hover:underline uppercase flex items-center gap-1 bg-white/80 px-2 py-0.5 border-2 border-[#164576] retro-shadow-hover transition-all"
          >
            <span>Kunjungi Web Utama</span>
            <span className="material-symbols-outlined text-[10px] font-black">arrow_outward</span>
          </a>
        </div>

      </div>

      {/* Retro bottom copyright text */}
      <footer className="absolute bottom-4 left-0 right-0 text-center font-mono text-[10px] text-[#164576] font-bold uppercase select-none opacity-85">
        &copy; {new Date().getFullYear()} TOPUPMAS Admin Portal &bull; All Rights Reserved
      </footer>
    </main>
  );
}
