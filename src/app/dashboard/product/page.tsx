"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../DashboardContext";
import styles from "../dashboard.module.css";
import {
  ProductItem,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../services/products";
import { BrandItem, fetchBrands } from "../../../services/brands";
import { GroupItem, fetchGroups } from "../../../services/groups";

export default function ProductPage() {
  const { playBeep } = useDashboard();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form States
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Games");
  const [formBrandName, setFormBrandName] = useState("");
  const [formType, setFormType] = useState("Diamonds");
  const [formSellPrice, setFormSellPrice] = useState<number>(0);
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSupplier, setFormSupplier] = useState("vip");
  const [formSupplierCode, setFormSupplierCode] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formGroupId, setFormGroupId] = useState<number | null>(null);
  const [formBrandId, setFormBrandId] = useState<number | null>(null);

  // Toast Notification State
  interface ToastItem {
    id: string;
    type: "success" | "error" | "info";
    message: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Custom Alert Modal State
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const showAlert = (title: string, message: string) => {
    setAlertDialog({ isOpen: true, title, message });
  };

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Authentication Context
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("admin_token");
    setToken(storedToken);
  }, []);

  const loadData = async (authToken: string) => {
    setIsLoading(true);
    try {
      // Load brands & groups first
      const [brandsData, groupsData] = await Promise.all([
        fetchBrands(),
        fetchGroups(authToken),
      ]);
      setBrands(brandsData);
      setGroups(groupsData);

      // Default to first brand to avoid loading entire catalog
      const defaultBrand = filterBrand || (brandsData.length > 0 ? brandsData[0].name : "ALL");
      if (!filterBrand && brandsData.length > 0) {
        setFilterBrand(defaultBrand);
      }

      // Fetch products filtered by brand (or all if no brands exist)
      const productsData = await fetchProducts(
        authToken,
        defaultBrand !== "ALL" ? { brand: defaultBrand } : undefined
      );
      setProducts(productsData);
    } catch (err: any) {
      showToast(err.message || "Gagal mengambil data dari server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData(token);
    } else if (isClient) {
      showToast("Token otorisasi admin tidak ditemukan. Silakan login kembali.", "error");
      setIsLoading(false);
    }
  }, [token, isClient]);



  const handleResetForm = () => {
    setIsEditing(false);
    setFormCode("");
    setFormName("");
    setFormCategory("Games");
    setFormBrandName("");
    setFormType("Diamonds");
    setFormSellPrice(0);
    setFormCostPrice(0);
    setFormSupplier("vip");
    setFormSupplierCode("");
    setFormIsActive(true);
    setFormGroupId(null);
    setFormBrandId(null);
  };

  const openAddModal = () => {
    handleResetForm();
    setShowModal(true);
    playBeep(300, "sine", 0.05);
  };

  const openEditModal = (p: ProductItem) => {
    playBeep(180, "sine", 0.05);
    setIsEditing(true);
    setFormCode(p.code);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormBrandName(p.brand);
    setFormType(p.type);
    setFormSellPrice(p.sell_price);
    setFormCostPrice(p.cost_price);
    setFormSupplier(p.supplier);
    setFormSupplierCode(p.supplier_code);
    setFormIsActive(p.is_active);
    setFormGroupId(p.product_group_id || null);
    setFormBrandId(p.brand_id || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    handleResetForm();
    playBeep(200, "sine", 0.04);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast("Aksi ditolak: Token otorisasi tidak ditemukan.", "error");
      return;
    }

    if (formSellPrice <= formCostPrice) {
      showAlert("PERINGATAN VALIDASI", "Harga jual harus lebih tinggi daripada harga modal (profit margin wajib positif).");
      return;
    }

    setIsSubmitting(true);
    playBeep(250, "triangle", 0.1);

    const payload = {
      name: formName.trim(),
      category: formCategory.trim(),
      brand: formBrandName.trim() || "General",
      type: formType.trim(),
      sell_price: Number(formSellPrice),
      cost_price: Number(formCostPrice),
      supplier: formSupplier.trim(),
      supplier_code: formSupplierCode.trim(),
      is_active: formIsActive,
      product_group_id: formGroupId ? Number(formGroupId) : null,
      brand_id: formBrandId ? Number(formBrandId) : null,
    };

    try {
      if (isEditing) {
        await updateProduct(token, formCode, payload);
        showToast(`Produk ${formCode} berhasil diperbarui!`, "success");
      } else {
        await createProduct(token, {
          code: formCode.trim(),
          ...payload,
        });
        showToast(`Produk ${formCode} berhasil dibuat!`, "success");
      }
      closeModal();
      await loadData(token);
      playBeep(440, "sine", 0.1);
    } catch (err: any) {
      showAlert("GAGAL MENYIMPAN", err.message || "Gagal menyimpan data produk.");
      playBeep(150, "sawtooth", 0.2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (code: string) => {
    if (!token) {
      showToast("Aksi ditolak: Token otorisasi tidak ditemukan.", "error");
      return;
    }

    showConfirm(
      "KONFIRMASI HAPUS",
      `Apakah Anda yakin ingin menghapus produk dengan SKU "${code}"? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        playBeep(150, "sawtooth", 0.2);
        try {
          await deleteProduct(token, code);
          await loadData(token);
          showToast(`Produk ${code} berhasil dihapus.`, "success");
          playBeep(300, "sine", 0.1);
        } catch (err: any) {
          showAlert("GAGAL MENGHAPUS", err.message || "Gagal menghapus produk.");
          playBeep(150, "sawtooth", 0.2);
        }
      }
    );
  };

  const handleToggleActive = async (p: ProductItem) => {
    if (!token) return;
    playBeep(200, "triangle", 0.1);
    try {
      await updateProduct(token, p.code, {
        name: p.name,
        category: p.category,
        brand: p.brand,
        type: p.type,
        sell_price: p.sell_price,
        cost_price: p.cost_price,
        supplier: p.supplier,
        supplier_code: p.supplier_code,
        is_active: !p.is_active,
        product_group_id: p.product_group_id || null,
        brand_id: p.brand_id || null,
      });
      await loadData(token);
      showToast(`Status keaktifan produk ${p.code} diubah.`, "success");
    } catch (err: any) {
      showAlert("GAGAL MENGUBAH STATUS", err.message || "Gagal mengubah status produk.");
    }
  };

  // Handle brand filter change — reload products from server
  const handleFilterBrandChange = async (brand: string) => {
    setFilterBrand(brand);
    if (!token) return;
    setIsLoading(true);
    try {
      const productsData = await fetchProducts(
        token,
        brand !== "ALL" ? { brand } : undefined
      );
      setProducts(productsData);
    } catch (err: any) {
      showToast(err.message || "Gagal mengambil data produk.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products by search query only (brand filtering is server-side)
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (!isClient) {
    return (
      <main className={styles.content}>
        <div className="flex flex-col items-center py-20">
          <span className="material-symbols-outlined text-4xl animate-spin text-[#164576]">sync</span>
          <span className="font-mono text-xs font-bold text-[#164576] mt-4">INITIALIZING COMMUNICATOR...</span>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.content}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Products SKU List</h1>
        <p className={styles.pageSubtitle}>Kelola individual item, harga beli, harga jual, dan status stok provider.</p>
      </div>

      <div className={styles.grid}>
        {/* FULL-WIDTH PRODUCT LIST CARD */}
        <div className={styles.cardProducts} style={{ gridColumn: "span 12" }}>

          {/* Top Bar: Search, Filter, Add Button */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 w-full">
            <div style={{ flex: "1 1 auto", width: "100%", minWidth: "250px" }}>
              <input
                type="text"
                placeholder="Cari berdasarkan nama SKU atau kode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="retro-input"
                style={{ padding: "10px 14px", fontSize: "14px" }}
              />
            </div>

            <div style={{ width: "220px", flexShrink: 0 }} className="w-full">
              <select
                value={filterBrand}
                onChange={(e) => handleFilterBrandChange(e.target.value)}
                className="retro-input"
                style={{ padding: "10px 14px", fontSize: "14px", height: "46px", appearance: "auto" }}
              >
                <option value="ALL">SEMUA BRAND</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openAddModal}
              className="retro-button text-sm font-black flex items-center justify-center gap-2 whitespace-nowrap"
              style={{
                backgroundColor: "var(--tertiary)",
                color: "var(--on-tertiary)",
                padding: "10px 20px",
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined font-bold" style={{ fontSize: "18px" }}>add</span>
              <span>TAMBAH SKU</span>
            </button>
          </div>



          {isLoading ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <span className="material-symbols-outlined text-4xl animate-spin" style={{ color: "#164576" }}>sync</span>
              <span className="font-mono text-xs font-bold text-[#164576]">RETRIEVING PRODUCT CATALOG...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 font-mono text-xs font-bold text-gray-500">
              Tidak ada data produk yang cocok atau terdaftar.
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>SKU Code</th>
                    <th>Nama Item</th>
                    <th>Brand</th>
                    <th>Provider</th>
                    <th>Harga Modal</th>
                    <th>Harga Jual</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const margin = p.sell_price > 0 ? ((p.sell_price - p.cost_price) / p.sell_price * 100).toFixed(1) : "0";
                    return (
                      <tr key={p.code}>
                        <td style={{ color: "#3a6470", fontWeight: "900", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
                          {p.code}
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <span className={styles.productName} style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>{p.name}</span>
                            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }} className="font-mono">
                              Margin: {margin}% | Group: <span style={{ color: "#164576" }}>{p.product_group_name || "-"}</span>
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>{p.brand}</td>
                        <td>
                          <span className="font-mono text-xs font-black px-2.5 py-1 border-2 border-[#0f172a] rounded bg-white text-[#164576] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" style={{ fontSize: "11px" }}>
                            {p.supplier.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: "#ba1a1a", fontSize: "15px", fontWeight: "800" }}>
                          Rp {p.cost_price.toLocaleString("id-ID")}
                        </td>
                        <td style={{ color: "#2d6a3e", fontWeight: "900", fontSize: "16px" }}>
                          Rp {p.sell_price.toLocaleString("id-ID")}
                        </td>
                        <td>
                          <span
                            onClick={() => handleToggleActive(p)}
                            style={{ cursor: "pointer", fontSize: "11px", padding: "6px 12px", borderWidth: "2.5px" }}
                            className={`${styles.statusBadge} ${
                              p.is_active ? styles.statusOnline : styles.statusOffline
                            }`}
                          >
                            {p.is_active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="font-mono text-xs font-black px-3 py-1.5 border-2 border-[#0f172a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-[#FDCC4E] text-[#735f00] cursor-pointer hover:translate-y-[0.5px]"
                              style={{ fontSize: "12px" }}
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteClick(p.code)}
                              className="font-mono text-xs font-black px-3 py-1.5 border-2 border-[#0f172a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-[#fce8e9] text-[#ba1a1a] cursor-pointer hover:translate-y-[0.5px]"
                              style={{ fontSize: "12px" }}
                            >
                              DEL
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========== MODAL ========== */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className="material-symbols-outlined">{isEditing ? "edit" : "add_box"}</span>
                {isEditing ? `Edit SKU: ${formCode}` : "Tambah SKU Baru"}
              </div>
              <button className={styles.modalCloseBtn} onClick={closeModal}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="retro-label" htmlFor="prod-code">KODE SKU</label>
                    <input
                      id="prod-code"
                      type="text"
                      placeholder="cth: ML-86"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="retro-input"
                      disabled={isSubmitting || isEditing}
                      required
                    />
                  </div>
                  <div>
                    <label className="retro-label" htmlFor="prod-name">NAMA SKU</label>
                    <input
                      id="prod-name"
                      type="text"
                      placeholder="cth: Mobile Legends 86 Diamonds"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="retro-input"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="retro-label" htmlFor="prod-category">KATEGORI</label>
                    <select
                      id="prod-category"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="retro-input"
                      style={{ appearance: "auto" }}
                    >
                      <option value="Games">Games</option>
                      <option value="Game Mobile">Game Mobile</option>
                      <option value="Game PC">Game PC</option>
                      <option value="E-Wallet">E-Wallet</option>
                      <option value="Pulsa & Data">Pulsa & Data</option>
                      <option value="Voucher">Voucher</option>
                    </select>
                  </div>
                  <div>
                    <label className="retro-label" htmlFor="prod-type">TIPE</label>
                    <select
                      id="prod-type"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="retro-input"
                      style={{ appearance: "auto" }}
                    >
                      <option value="Diamonds">Diamonds</option>
                      <option value="UC">UC</option>
                      <option value="VP">VP</option>
                      <option value="Coins">Coins</option>
                      <option value="Topup">Topup</option>
                      <option value="Pulsa">Pulsa</option>
                      <option value="Paket Data">Paket Data</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="retro-label" htmlFor="prod-brand">BRAND</label>
                    <select
                      id="prod-brand"
                      value={formBrandId || ""}
                      onChange={(e) => {
                        const idVal = e.target.value ? Number(e.target.value) : null;
                        setFormBrandId(idVal);
                        if (idVal) {
                          const bObj = brands.find((b) => b.id === idVal);
                          if (bObj) {
                            setFormBrandName(bObj.name);
                          }
                        } else {
                          setFormBrandName("");
                        }
                      }}
                      className="retro-input"
                      style={{ appearance: "auto" }}
                      required
                    >
                      <option value="">-- PILIH BRAND --</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="retro-label" htmlFor="prod-group">GROUP</label>
                    <select
                      id="prod-group"
                      value={formGroupId || ""}
                      onChange={(e) => setFormGroupId(e.target.value ? Number(e.target.value) : null)}
                      className="retro-input"
                      style={{ appearance: "auto" }}
                    >
                      <option value="">-- PILIH GROUP --</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="retro-label" htmlFor="prod-cost">HARGA MODAL</label>
                    <input
                      id="prod-cost"
                      type="number"
                      placeholder="0"
                      value={formCostPrice || ""}
                      onChange={(e) => setFormCostPrice(Number(e.target.value))}
                      className="retro-input"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div>
                    <label className="retro-label" htmlFor="prod-sell">HARGA JUAL</label>
                    <input
                      id="prod-sell"
                      type="number"
                      placeholder="0"
                      value={formSellPrice || ""}
                      onChange={(e) => setFormSellPrice(Number(e.target.value))}
                      className="retro-input"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="retro-label" htmlFor="prod-supplier">SUPPLIER</label>
                    <select
                      id="prod-supplier"
                      value={formSupplier}
                      onChange={(e) => setFormSupplier(e.target.value)}
                      className="retro-input"
                      style={{ appearance: "auto" }}
                    >
                      <option value="vip">VIP RESELLER</option>
                      <option value="digiflazz">DIGIFLAZZ</option>
                      <option value="apigames">APIGAMES</option>
                      <option value="lapakpulsa">LAPAKPULSA</option>
                    </select>
                  </div>
                  <div>
                    <label className="retro-label" htmlFor="prod-supcode">KODE SUPPLIER</label>
                    <input
                      id="prod-supcode"
                      type="text"
                      placeholder="cth: mlbb_86"
                      value={formSupplierCode}
                      onChange={(e) => setFormSupplierCode(e.target.value)}
                      className="retro-input"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    id="prod-active"
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="prod-active" className="font-mono text-xs font-black text-[#164576] cursor-pointer">
                    STATUS AKTIF / SUSPEND
                  </label>
                </div>

                <div className="flex gap-2 mt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="retro-button flex-1 text-sm font-black flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: "var(--tertiary)",
                      color: "var(--on-tertiary)",
                      padding: "10px 16px",
                    }}
                  >
                    <span>{isSubmitting ? "SAVING..." : isEditing ? "UPDATE SKU" : "SAVE SKU"}</span>
                    <span className="material-symbols-outlined font-bold">save</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="retro-button text-sm font-black flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: "white",
                      color: "black",
                      padding: "10px 16px",
                    }}
                  >
                    <span>BATAL</span>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* ========== TOAST NOTIFICATION CONTAINER ========== */}
      <div 
        style={{
          position: "fixed",
          top: "100px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          pointerEvents: "none",
          width: "420px",
          maxWidth: "calc(100vw - 48px)"
        }}
      >
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          return (
            <div
              key={t.id}
              className="animate-toast"
              style={{
                pointerEvents: "auto",
                position: "relative",
                backgroundColor: isSuccess ? "#eaf7ed" : isError ? "#fce8e9" : "#e4f2fa",
                color: isSuccess ? "#2d6a3e" : isError ? "#ba1a1a" : "#164576",
                border: "4px solid #0f172a",
                boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
                padding: "20px 24px",
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                fontWeight: "900",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                borderRadius: "12px",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px", fontWeight: "900" }}>
                  {isSuccess ? "check_circle" : isError ? "warning" : "info"}
                </span>
                <span style={{ lineHeight: "1.4" }}>{t.message}</span>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  fontSize: "16px",
                  fontWeight: "900",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.7
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "0.7")}
              >
                ✕
              </button>

              {/* Progress Bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "6px",
                  backgroundColor: isSuccess ? "#2d6a3e" : isError ? "#ba1a1a" : "#164576",
                  animation: "shrinkWidth 4s linear forwards"
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ========== CUSTOM ALERT DIALOG ========== */}
      {alertDialog.isOpen && (
        <div className={styles.modalOverlay} onClick={() => setAlertDialog({ isOpen: false, title: "", message: "" })}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modalHeader} style={{ backgroundColor: "#ffdad6", borderBottom: "3px solid #0f172a" }}>
              <div className={styles.modalTitle} style={{ color: "#ba1a1a" }}>
                <span className="material-symbols-outlined">warning</span>
                {alertDialog.title}
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setAlertDialog({ isOpen: false, title: "", message: "" })}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
              </button>
            </div>
            {/* Body */}
            <div className={styles.modalBody} style={{ padding: "20px" }}>
              <p className="font-mono text-sm font-bold text-[#41484a] leading-relaxed mb-6">
                {alertDialog.message}
              </p>
              <button
                onClick={() => setAlertDialog({ isOpen: false, title: "", message: "" })}
                className="retro-button w-full text-sm font-black py-2.5"
                style={{
                  backgroundColor: "#FDCC4E",
                  color: "#735f00",
                }}
              >
                MENGERTI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== CUSTOM CONFIRM DIALOG ========== */}
      {confirmDialog.isOpen && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modalHeader} style={{ backgroundColor: "#ffdad6", borderBottom: "3px solid #0f172a" }}>
              <div className={styles.modalTitle} style={{ color: "#ba1a1a" }}>
                <span className="material-symbols-outlined">help_center</span>
                {confirmDialog.title}
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
              </button>
            </div>
            {/* Body */}
            <div className={styles.modalBody} style={{ padding: "20px" }}>
              <p className="font-mono text-sm font-bold text-[#41484a] leading-relaxed mb-6">
                {confirmDialog.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDialog.onConfirm}
                  className="retro-button flex-1 text-sm font-black py-2.5"
                  style={{
                    backgroundColor: "#BF2D32",
                    color: "white",
                  }}
                >
                  YA, HAPUS
                </button>
                <button
                  onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                  className="retro-button flex-1 text-sm font-black py-2.5"
                  style={{
                    backgroundColor: "white",
                    color: "black",
                  }}
                >
                  BATAL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toastFadeInOut {
          0% {
            transform: translateX(120%);
            opacity: 0;
          }
          6% {
            transform: translateX(0);
            opacity: 1;
          }
          94% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(120%);
            opacity: 0;
          }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast {
          animation: toastFadeInOut 4.0s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </main>
  );
}
