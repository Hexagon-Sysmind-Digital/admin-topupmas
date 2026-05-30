"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import styles from "./dashboard.module.css";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    isSoundOn,
    setIsSoundOn,
    playBeep,
    currentTime,
    handleLogout,
    providers,
  } = useDashboard();

  const isProductPath =
    pathname.startsWith("/dashboard/groups") ||
    pathname.startsWith("/dashboard/brands") ||
    pathname.startsWith("/dashboard/product");

  const [isProductOpen, setIsProductOpen] = useState(isProductPath);

  // Sync if route changes
  useEffect(() => {
    if (isProductPath) {
      setIsProductOpen(true);
    }
  }, [pathname, isProductPath]);

  const toggleProductMenu = () => {
    playBeep(200, "sine", 0.05);
    setIsProductOpen((prev) => !prev);
  };

  const isAnyProviderDown = providers.some((p) => p.status === "OFFLINE");
  const offlineProviders = providers.filter((p) => p.status === "OFFLINE").map((p) => p.name);

  return (
    <div className={styles.container}>
      {/* LEFT SIDEBAR (Retro) */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className="material-symbols-outlined" style={{ color: "#164576" }}>stars</span>
          <span>TopUpMas</span>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/dashboard"
            onClick={() => playBeep(200, "sine", 0.05)}
            className={`${styles.navItem} ${pathname === "/dashboard" ? styles.active : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/dashboard" ? "'FILL' 1" : undefined }}>dashboard</span>
            Command Center
          </Link>

          {/* Product Dropdown Navigation */}
          <div
            onClick={toggleProductMenu}
            className={`${styles.navItem} ${isProductPath ? styles.navItemOpen : ""}`}
            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isProductPath ? "'FILL' 1" : undefined }}>inventory_2</span>
              Product
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              {isProductOpen ? "expand_less" : "expand_more"}
            </span>
          </div>

          {/* Collapsible Submenus */}
          {isProductOpen && (
            <div className={styles.subMenu}>
              <Link
                href="/dashboard/groups"
                onClick={() => playBeep(200, "sine", 0.05)}
                className={`${styles.subNavItem} ${pathname === "/dashboard/groups" ? styles.subNavItemActive : ""}`}
              >
                Groups
              </Link>
              <Link
                href="/dashboard/brands"
                onClick={() => playBeep(200, "sine", 0.05)}
                className={`${styles.subNavItem} ${pathname === "/dashboard/brands" ? styles.subNavItemActive : ""}`}
              >
                Brands
              </Link>
              <Link
                href="/dashboard/product"
                onClick={() => playBeep(200, "sine", 0.05)}
                className={`${styles.subNavItem} ${pathname === "/dashboard/product" ? styles.subNavItemActive : ""}`}
              >
                Product List
              </Link>
            </div>
          )}

          <div className={styles.navItem} onClick={() => playBeep(120, "sine", 0.05)}>
            <span className="material-symbols-outlined">map</span>
            Star Chart
          </div>
          <div className={styles.navItem} onClick={() => playBeep(120, "sine", 0.05)}>
            <span className="material-symbols-outlined">build</span>
            Repair Bay
          </div>
          <div className={styles.navItem} onClick={() => playBeep(120, "sine", 0.05)}>
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
              onClick={() => {
                setIsSoundOn(!isSoundOn);
                playBeep(400, "sine", 0.05);
              }}
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
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
