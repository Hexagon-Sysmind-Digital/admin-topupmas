"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../DashboardContext";
import styles from "../dashboard.module.css";
import {
  GroupItem,
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../../../services/groups";

export default function GroupsPage() {
  const { playBeep } = useDashboard();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formId, setFormId] = useState<number | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("admin_token");
    setToken(storedToken);
  }, []);

  const loadGroups = async (authToken: string) => {
    setIsLoading(true);
    try {
      const data = await fetchGroups(authToken);
      setGroups(data);
    } catch (err: any) {
      showToast(err.message || "Gagal menghubungi server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadGroups(token);
    } else if (isClient) {
      showToast("Token otorisasi admin tidak ditemukan. Silakan login kembali.", "error");
      setIsLoading(false);
    }
  }, [token, isClient]);

  const openAddModal = () => {
    setIsEditing(false);
    setFormName("");
    setFormId(null);
    setShowModal(true);
    playBeep(300, "sine", 0.05);
  };

  const openEditModal = (group: GroupItem) => {
    setIsEditing(true);
    setFormName(group.name);
    setFormId(group.id);
    setShowModal(true);
    playBeep(180, "sine", 0.05);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormName("");
    setFormId(null);
    setIsEditing(false);
    playBeep(200, "sine", 0.04);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    if (!token) {
      showToast("Aksi ditolak: Token otorisasi tidak ditemukan.", "error");
      return;
    }

    setIsSubmitting(true);
    playBeep(250, "triangle", 0.1);

    try {
      if (isEditing && formId) {
        await updateGroup(token, formId, formName.trim());
        showToast("Group berhasil diperbarui!", "success");
      } else {
        await createGroup(token, formName.trim());
        showToast("Group berhasil ditambahkan!", "success");
      }
      closeModal();
      await loadGroups(token);
      playBeep(440, "sine", 0.1);
    } catch (err: any) {
      showAlert("GAGAL MENYIMPAN", err.message || "Gagal menyimpan group");
      playBeep(150, "sawtooth", 0.2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = (id: number) => {
    if (!token) {
      showToast("Aksi ditolak: Token otorisasi tidak ditemukan.", "error");
      return;
    }

    showConfirm(
      "KONFIRMASI HAPUS",
      "Apakah Anda yakin ingin menghapus product group ini? Tindakan ini tidak dapat dibatalkan.",
      async () => {
        playBeep(150, "sawtooth", 0.2);
        try {
          await deleteGroup(token, id);
          await loadGroups(token);
          showToast("Group berhasil dihapus.", "success");
          playBeep(300, "sine", 0.1);
        } catch (err: any) {
          showAlert("GAGAL MENGHAPUS", err.message || "Gagal menghapus group");
          playBeep(150, "sawtooth", 0.2);
        }
      }
    );
  };

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

  const TOY_ICONS = [
    "smart_toy",
    "extension",
    "sports_esports",
    "rocket_launch",
    "castle",
    "casino",
    "pets",
    "celebration",
    "savings",
    "cruelty_free"
  ];

  const getToyIcon = (id: number) => {
    return TOY_ICONS[id % TOY_ICONS.length];
  };

  return (
    <main className={styles.content}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Product Groups</h1>
        <p className={styles.pageSubtitle}>Kelola kategori produk dan pengelompokan layanan TopUpMas.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.cardProducts} style={{ gridColumn: "span 12" }}>

          {/* Top Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>
              <span className="material-symbols-outlined">format_list_bulleted</span>
              Daftar Group Layanan
            </h3>
            <button
              onClick={openAddModal}
              className="retro-button text-sm font-black flex items-center justify-center gap-2 whitespace-nowrap"
              style={{
                backgroundColor: "var(--tertiary)",
                color: "var(--on-tertiary)",
                padding: "10px 20px",
              }}
            >
              <span className="material-symbols-outlined font-bold" style={{ fontSize: "18px" }}>add</span>
              <span>TAMBAH GROUP</span>
            </button>
          </div>



          {isLoading ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <span className="material-symbols-outlined text-4xl animate-spin" style={{ color: "#164576" }}>sync</span>
              <span className="font-mono text-xs font-bold text-[#164576]">RETRIEVING DATA FROM PORTAL...</span>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-16 font-mono text-xs font-bold text-gray-500">
              Tidak ada data product group yang ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="retro-box p-4 flex flex-col items-center justify-between gap-3 text-center bg-white relative hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  style={{ minHeight: "160px" }}
                >


                  {/* Random Toy Icon */}
                  <div className="w-12 h-12 flex items-center justify-center border-2 border-[#0f172a] bg-[#f0f8fd] rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-3">
                    <span className="material-symbols-outlined text-[#164576] text-xl">
                      {getToyIcon(group.id)}
                    </span>
                  </div>

                  {/* Group Name */}
                  <div className="font-bold text-sm text-[#0f172a] uppercase tracking-wide px-1">
                    {group.name}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full mt-1">
                    <button
                      onClick={() => openEditModal(group)}
                      className="font-mono text-[11px] font-black px-2 py-1 border-2 border-[#0f172a] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] bg-[#FDCC4E] text-[#735f00] cursor-pointer flex-1 text-center hover:translate-y-[0.5px]"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="font-mono text-[11px] font-black px-2 py-1 border-2 border-[#0f172a] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] bg-[#fce8e9] text-[#ba1a1a] cursor-pointer flex-1 text-center hover:translate-y-[0.5px]"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== MODAL ========== */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className="material-symbols-outlined">{isEditing ? "edit" : "add_box"}</span>
                {isEditing ? "Edit Group" : "Tambah Group Baru"}
              </div>
              <button className={styles.modalCloseBtn} onClick={closeModal}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
              </button>
            </div>

            <div className={styles.modalBody}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="retro-label" htmlFor="group-name-input">NAMA GROUP</label>
                  <input
                    id="group-name-input"
                    type="text"
                    placeholder="cth: Monthly Diamond Pass"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="retro-input"
                    disabled={isSubmitting}
                    required
                    autoFocus
                  />
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
                    <span>{isSubmitting ? "SAVING..." : isEditing ? "UPDATE GROUP" : "SUBMIT GROUP"}</span>
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
