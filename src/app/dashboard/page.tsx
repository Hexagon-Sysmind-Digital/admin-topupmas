"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

interface Provider {
  name: string;
  balance: string;
  balanceNum: number;
  maxBalance: number;
  color: string;
  status: "ONLINE" | "OFFLINE";
}

interface TopProduct {
  rank: number;
  name: string;
  sold: number;
  maxSold: number;
  revenue: string;
  color: string;
}

export default function DashboardPage() {
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

  const topProducts: TopProduct[] = [
    { rank: 1, name: "Mobile Legends 86 DM", sold: 412, maxSold: 450, revenue: "Rp 4.12M", color: "#FDCC4E" },
    { rank: 2, name: "Free Fire 100 DM", sold: 387, maxSold: 450, revenue: "Rp 3.87M", color: "#78BFE4" },
    { rank: 3, name: "PUBG Mobile 60 UC", sold: 315, maxSold: 450, revenue: "Rp 3.15M", color: "#B1D99D" },
    { rank: 4, name: "Genshin Impact 60 GC", sold: 289, maxSold: 450, revenue: "Rp 2.89M", color: "#164576" },
    { rank: 5, name: "Valorant 125 VP", sold: 256, maxSold: 450, revenue: "Rp 2.56M", color: "#BF2D32" },
  ];

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

  const handleLogout = () => {
    playBeep(150, "sawtooth", 0.2);
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

  const isAnyProviderDown = providers.some((p) => p.status === "OFFLINE");
  const offlineProviders = providers.filter((p) => p.status === "OFFLINE").map((p) => p.name);

  return (
    <div className={styles.container}>
      {/* LEFT SIDEBAR (Retro) */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className="material-symbols-outlined" style={{color: "#164576"}}>stars</span>
          <span>TopUpMas</span>
        </div>

        <nav className={styles.nav}>
          <div className={`${styles.navItem} ${styles.active}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            Command Center
          </div>
          <div className={styles.navItem}>
            <span className="material-symbols-outlined">map</span>
            Star Chart
          </div>
          <div className={styles.navItem}>
            <span className="material-symbols-outlined">inventory_2</span>
            Toy Box
          </div>
          <div className={styles.navItem}>
            <span className="material-symbols-outlined">build</span>
            Repair Bay
          </div>
          <div className={styles.navItem}>
            <span className="material-symbols-outlined">analytics</span>
            Reports
          </div>
        </nav>
      </aside>

      {/* MAIN WRAPPER */}
      <div className={styles.mainWrapper}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>Andy's Admin Base</div>

          <div className={styles.headerActions}>
            <span className={styles.time}>{currentTime}</span>
            <button
              onClick={() => { setIsSoundOn(!isSoundOn); playBeep(400, "sine", 0.05); }}
              className={styles.iconBtn}
            >
              <span className="material-symbols-outlined">{isSoundOn ? "volume_up" : "volume_off"}</span>
            </button>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              LOGOUT
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
            </button>
          </div>
        </header>

        {/* PROVIDER DOWN ALERT */}
        {isAnyProviderDown && (
          <div className={styles.alertBar}>
            <div className={styles.alertContent}>
              <span className="material-symbols-outlined">warning</span>
              <span>
                ALERT: PROVIDER <span className={styles.alertTag}>{offlineProviders.join(", ")}</span> IS OFFLINE!
              </span>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Command & KPI Center</h1>
            <p className={styles.pageSubtitle}>Pantau statistik finansial dan status provider hari ini secara real-time.</p>
          </div>

          <div className={styles.grid}>
            
            {/* 1. HERO KPI (Pizza Planet Card) */}
            <div className={styles.cardHero}>
              <div className={styles.heroInner}>
                <div className={styles.heroHeader}>
                  <div className={styles.heroBadge}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>star</span>
                    Pusat Komando Utama
                  </div>
                </div>

                <div className={styles.heroMain}>
                  <div className={styles.heroIcon}>
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <h2 className={styles.heroTitle}>Revenue Hari Ini</h2>
                    <p className={styles.heroDesc}>Data performa finansial real-time yang masuk melalui seluruh provider gerbang pembayaran.</p>
                  </div>
                </div>

                <div className={styles.heroStats}>
                  <div className={styles.heroStatItem}>
                    <div className={styles.heroStatLabel}>TOTAL REVENUE</div>
                    <div className={styles.heroStatValue}>Rp 24.850.000</div>
                  </div>
                  <div className={styles.heroStatItem}>
                    <div className={styles.heroStatLabel}>TARGET SALES (83%)</div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: "83%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TARGET TIERS */}
            <div className={styles.cardStats}>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined">trending_up</span>
                Target Tiers
              </h3>
              
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Success Rate</span>
                <span className={styles.statVal}>99.12%</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Profit Margin</span>
                <span className={styles.statVal}>Rp 2.150.000</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Active Missions</span>
                <span className={styles.statVal}>124</span>
              </div>
            </div>

            {/* 3. PROVIDER BALANCES */}
            <div className={styles.cardProviders}>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined">ev_station</span>
                Saldo Provider
              </h3>
              
              <div className={styles.providerList}>
                {providers.map((p) => (
                  <div key={p.name} className={styles.providerItem} onClick={() => toggleProvider(p.name)}>
                    <div className={styles.providerInfo}>
                      <div className={styles.providerIcon} style={{ background: p.color }}>
                        <span className="material-symbols-outlined">payments</span>
                      </div>
                      <div>
                        <div className={styles.providerName}>{p.name}</div>
                        <div className={styles.providerBal}>{p.balance}</div>
                      </div>
                    </div>
                    <div className={`${styles.statusBadge} ${p.status === "ONLINE" ? styles.statusOnline : styles.statusOffline}`}>
                      {p.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. TOP PRODUCTS */}
            <div className={styles.cardProducts}>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined">local_activity</span>
                Top 5 Produk Terlaris
              </h3>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Nama Produk</th>
                      <th>Terjual</th>
                      <th>Revenue</th>
                      <th>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((prod) => (
                      <tr key={prod.rank}>
                        <td style={{ color: "#3a6470", fontWeight: "800" }}>#{prod.rank}</td>
                        <td className={styles.productName}>{prod.name}</td>
                        <td style={{ color: "#41484a" }}>{prod.sold} pcs</td>
                        <td style={{ fontWeight: "800", color: "#164576" }}>{prod.revenue}</td>
                        <td>
                          <div className={styles.volBar}>
                            <div className={styles.volFill} style={{ width: `${(prod.sold / prod.maxSold) * 100}%`, background: prod.color }}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
