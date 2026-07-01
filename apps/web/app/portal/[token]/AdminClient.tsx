"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Auth helpers (client-side PIN, same as before) ───────────────────────────

const PIN_HASH_KEY = "nord_cafe_pin_hash";
const SESSION_KEY = "nord_cafe_session";
const ATTEMPTS_KEY = "nord_cafe_attempts";
const LOCKOUT_UNTIL_KEY = "nord_cafe_lockout_until";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;
const DEFAULT_PIN = "NORD2024";

async function sha256(str: string): Promise<string> {
  const data = new TextEncoder().encode(str.toUpperCase().trim());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function initPin() {
  if (!localStorage.getItem(PIN_HASH_KEY)) {
    localStorage.setItem(PIN_HASH_KEY, await sha256(DEFAULT_PIN));
  }
}

async function verifyPin(pin: string): Promise<boolean> {
  await initPin();
  return (await sha256(pin)) === localStorage.getItem(PIN_HASH_KEY);
}

function isLockedOut(): { locked: boolean; remainingMs: number } {
  const until = localStorage.getItem(LOCKOUT_UNTIL_KEY);
  if (!until) return { locked: false, remainingMs: 0 };
  const rem = parseInt(until) - Date.now();
  if (rem <= 0) {
    localStorage.removeItem(LOCKOUT_UNTIL_KEY);
    localStorage.setItem(ATTEMPTS_KEY, "0");
    return { locked: false, remainingMs: 0 };
  }
  return { locked: true, remainingMs: rem };
}

function recordFail(): { attemptsLeft: number; lockedOut: boolean } {
  const cur = parseInt(localStorage.getItem(ATTEMPTS_KEY) ?? "0") + 1;
  localStorage.setItem(ATTEMPTS_KEY, String(cur));
  if (cur >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCKOUT_UNTIL_KEY, String(Date.now() + LOCKOUT_MS));
    localStorage.setItem(ATTEMPTS_KEY, "0");
    return { attemptsLeft: 0, lockedOut: true };
  }
  return { attemptsLeft: MAX_ATTEMPTS - cur, lockedOut: false };
}

function createSession() {
  sessionStorage.setItem(SESSION_KEY, btoa(`nord_${Date.now()}`));
}
function isAuth() {
  return !!sessionStorage.getItem(SESSION_KEY);
}
function destroySession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Order store helpers ───────────────────────────────────────────────────────

const STORAGE_KEY = "nord_cafe_orders";

type OrderStatus = "Pending" | "Preparing" | "Ready" | "Completed";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  orderId: string;
  customerName: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx === -1) return;
  orders[idx] = { ...orders[idx], status, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function updateOrderDetails(orderId: string, customerName: string, tableNumber: string) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx === -1) return;
  orders[idx] = { ...orders[idx], customerName, tableNumber, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// ─── Print Receipt Helper ─────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

function printReceipt(order: Order) {
  const d = new Date(order.createdAt);
  const receiptContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; font-size: 14px; }
          .receipt { max-width: 300px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 20px; }
          .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>NORD CAFE</h1>
            <p>Jl. Contoh No. 123</p>
            <p>Telp: 0812-3456-7890</p>
          </div>
          <div>
            <p><strong>Order ID:</strong> #${order.orderId}</p>
            <p><strong>Nama:</strong> ${order.customerName}</p>
            <p><strong>Meja:</strong> ${order.tableNumber === "0" ? "Takeaway" : `Table ${order.tableNumber}`}</p>
            <p><strong>Tanggal:</strong> ${d.toLocaleDateString("id-ID")} ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div class="divider"></div>
          <div>
            ${order.items.map(item => `
              <div class="item">
                <span>${item.quantity}x ${item.name}</span>
                <span>${item.price}</span>
              </div>
            `).join('')}
          </div>
          <div class="divider"></div>
          <div class="item">
            <span>Subtotal</span>
            <span>${formatRupiah(order.subtotal)}</span>
          </div>
          <div class="item">
            <span>Pajak</span>
            <span>${formatRupiah(order.tax)}</span>
          </div>
          <div class="item total">
            <span>TOTAL</span>
            <span>${formatRupiah(order.total)}</span>
          </div>
          <div class="footer">
            <p>Terima kasih!</p>
            <p>Selamat menikmati</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    // Optional: close after print
    // printWindow.onafterprint = () => printWindow.close();
  }
}

// ─── Lock Screen Component ────────────────────────────────────────────────────

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error" | "locked" | "success">("idle");
  const [msg, setMsg] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [lockSecs, setLockSecs] = useState(0);

  useEffect(() => { initPin(); }, []);

  useEffect(() => {
    if (state !== "locked") return;
    const t = setInterval(() => {
      const { locked, remainingMs } = isLockedOut();
      if (!locked) { setState("idle"); setAttemptsLeft(5); setPin(""); }
      else setLockSecs(Math.ceil(remainingMs / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [state]);

  const submit = useCallback(async () => {
    if (state === "loading" || state === "locked" || !pin.trim()) return;
    const { locked, remainingMs } = isLockedOut();
    if (locked) { setState("locked"); setLockSecs(Math.ceil(remainingMs / 1000)); return; }
    setState("loading");
    const valid = await verifyPin(pin);
    if (valid) {
      localStorage.removeItem(ATTEMPTS_KEY);
      createSession();
      setState("success");
      setTimeout(onUnlock, 600);
    } else {
      const { attemptsLeft: left, lockedOut } = recordFail();
      if (lockedOut) {
        setState("locked");
        setLockSecs(Math.ceil(LOCKOUT_MS / 1000));
        setMsg("Terlalu banyak percobaan. Tunggu sebentar.");
      } else {
        setState("error");
        setAttemptsLeft(left);
        setMsg(`PIN salah. ${left} percobaan tersisa.`);
        setPin("");
        setTimeout(() => setState("idle"), 1500);
      }
    }
  }, [pin, state, onUnlock]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {/* Glow blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(253,139,0,0.08), transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(51,33,13,0.05), transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: 420, background: "var(--color-surface-container-lowest)", borderRadius: 24, border: "1px solid rgba(210,196,186,0.25)", boxShadow: "0 24px 64px rgba(75,54,33,0.12)", padding: "48px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: state === "error" || state === "locked" ? "rgba(186,26,26,0.08)" : state === "success" ? "rgba(144,77,0,0.12)" : "rgba(253,139,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, transition: "all 0.3s" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: state === "error" || state === "locked" ? "var(--color-error)" : "var(--color-secondary-container)", transition: "color 0.3s" }}>
            {state === "success" ? "lock_open" : state === "locked" ? "lock_clock" : "lock"}
          </span>
        </div>

        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: 36, fontWeight: 600, color: "var(--color-secondary)", letterSpacing: "-0.02em", marginBottom: 4 }}>Nord Cafe</h1>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-on-surface-variant)", opacity: 0.6, marginBottom: 40 }}>Kasir Admin Portal</p>

        {state === "locked" ? (
          <div style={{ textAlign: "center", background: "var(--color-error-container)", borderRadius: 12, padding: "20px 24px" }}>
            <p style={{ color: "var(--color-on-error-container)", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Akses Sementara Dikunci</p>
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 48, fontWeight: 600, color: "var(--color-error)", lineHeight: 1 }}>{lockSecs}s</p>
          </div>
        ) : (
          <>
            <div style={{ width: "100%", marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: 8 }}>PIN Kasir</label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan PIN"
                value={pin}
                onChange={(e) => { setPin(e.target.value); if (state === "error") setState("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                disabled={state === "loading" || state === "success"}
                style={{ width: "100%", padding: "16px 20px", fontSize: 24, letterSpacing: "0.3em", fontFamily: "monospace", border: `2px solid ${state === "error" ? "var(--color-error)" : state === "success" ? "var(--color-secondary)" : "var(--color-outline-variant)"}`, borderRadius: 12, background: "var(--color-surface-container-low)", color: "var(--color-primary)", outline: "none", textAlign: "center", boxSizing: "border-box", animation: state === "error" ? "shake 0.4s ease" : "none", transition: "border-color 0.2s" }}
              />
            </div>

            <p style={{ height: 20, fontSize: 13, color: "var(--color-error)", textAlign: "center", marginBottom: 16, visibility: state === "error" ? "visible" : "hidden" }}>{msg}</p>

            <button
              onClick={submit}
              disabled={!pin.trim() || state !== "idle"}
              style={{ width: "100%", padding: "16px 24px", fontSize: 16, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif", color: "#fff", background: state === "success" ? "#c8c8b0" : "var(--color-secondary-container)", border: "none", borderRadius: 12, cursor: pin.trim() && state === "idle" ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: !pin.trim() ? 0.5 : 1, boxShadow: pin.trim() && state === "idle" ? "0 4px 20px rgba(253,139,0,0.3)" : "none", transition: "all 0.25s" }}
            >
              {state === "loading" && <><span className="material-symbols-outlined" style={{ fontSize: 20, animation: "spin 1s linear infinite" }}>sync</span>Memverifikasi...</>}
              {state === "success" && <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>Akses Diberikan</>}
              {(state === "idle" || state === "error") && <>Buka Dashboard<span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span></>}
            </button>

            {attemptsLeft < 5 && (
              <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < attemptsLeft ? "var(--color-secondary)" : "var(--color-error)", opacity: i < attemptsLeft ? 0.3 : 0.8, transition: "all 0.3s" }} />
                ))}
              </div>
            )}
          </>
        )}

        <p style={{ marginTop: 28, fontSize: 12, color: "var(--color-on-surface-variant)", opacity: 0.4, textAlign: "center" }}>
          Default PIN: <code style={{ fontFamily: "monospace", background: "var(--color-surface-container)", padding: "2px 6px", borderRadius: 4 }}>NORD2024</code>
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
      `}</style>
    </div>
  );
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { bg: string; color: string; actionLabel: string; actionBg: string; actionColor: string; next: OrderStatus }> = {
  Pending: { bg: "var(--color-error-container)", color: "var(--color-on-error-container)", actionLabel: "Start Prep", actionBg: "var(--color-secondary)", actionColor: "#fff", next: "Preparing" },
  Preparing: { bg: "var(--color-secondary-fixed)", color: "var(--color-on-secondary-fixed-variant)", actionLabel: "Mark Ready", actionBg: "var(--color-tertiary)", actionColor: "#fff", next: "Ready" },
  Ready: { bg: "var(--color-tertiary-fixed)", color: "var(--color-on-tertiary-fixed-variant)", actionLabel: "Complete", actionBg: "var(--color-primary)", actionColor: "#fff", next: "Completed" },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editName, setEditName] = useState("");
  const [editTable, setEditTable] = useState("");

  const refresh = useCallback(() => setOrders(getOrders()), []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  const active = orders.filter((o) => o.status !== "Completed");
  const filtered = orders.filter((o) =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.tableNumber.includes(search) ||
    o.orderId.toLowerCase().includes(search.toLowerCase())
  );

  const revenue = orders.filter((o) => o.status === "Completed").reduce((s, o) => s + o.total, 0);

  const handleAction = (order: Order) => {
    const cfg = STATUS_CFG[order.status];
    if (!cfg) return;
    setUpdating(order.orderId);
    updateOrderStatus(order.orderId, cfg.next);
    setTimeout(() => { refresh(); setUpdating(null); }, 300);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditName(order.customerName);
    setEditTable(order.tableNumber);
  };

  const saveEdit = () => {
    if (editingOrder) {
      updateOrderDetails(editingOrder.orderId, editName, editTable);
      refresh();
      setEditingOrder(null);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "menu", label: "Menu", icon: "restaurant_menu" },
    { id: "staff", label: "Staff", icon: "group" },
    { id: "analytics", label: "Analytics", icon: "analytics" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Desktop Sidebar */}
      <aside style={{ display: "none", flexDirection: "column", position: "fixed", left: 0, top: 0, height: "100vh", width: 256, background: "var(--color-surface-container-low)", borderRight: "1px solid rgba(210,196,186,0.2)", padding: 24, zIndex: 50 }} className="md-sidebar">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: 32, fontWeight: 600, color: "var(--color-secondary)", marginBottom: 4 }}>Nord Cafe</h1>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Admin Portal</p>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: activeTab === item.id ? "var(--color-secondary)" : "transparent", color: activeTab === item.id ? "#fff" : "var(--color-on-surface-variant)", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 16, fontWeight: activeTab === item.id ? 700 : 500, textAlign: "left", width: "100%", transition: "all 0.15s" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid rgba(210,196,186,0.2)", paddingTop: 16 }}>
          <button onClick={() => { destroySession(); onLogout(); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: "var(--color-error)", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 16, fontWeight: 500, width: "100%", transition: "all 0.15s" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header style={{ position: "sticky", top: 0, background: "var(--color-background)", borderBottom: "1px solid rgba(210,196,186,0.15)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 50 }} className="mobile-only">
        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: 24, fontWeight: 600, color: "var(--color-secondary)" }}>Nord Cafe Admin</h1>
        <button onClick={() => { destroySession(); onLogout(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-error)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>Logout
        </button>
      </header>

      {/* Main */}
      <main style={{ padding: "32px 20px 100px" }} className="main-content">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Header row */}
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-secondary)", display: "block", marginBottom: 6 }}>Panel Utama</span>
            <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: "clamp(28px,4vw,36px)", fontWeight: 500, color: "var(--color-primary)", marginBottom: 10 }}>Dashboard Terpadu</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>list_alt</span>{active.length} Active Orders</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>payments</span>${formatRupiah(revenue)} Revenue</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.5, fontSize: 11 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>Live • updates every 3s</span>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20, marginBottom: 40 }}>
            {[
              { label: "ACTIVE ORDERS", value: String(active.length).padStart(2, "0"), icon: "list_alt" },
              { label: "TOTAL REVENUE", value: formatRupiah(revenue), icon: "payments" },
              { label: "PREPARING", value: String(orders.filter(o => o.status === "Preparing").length).padStart(2, "0"), icon: "soup_kitchen" },
              { label: "READY TO SERVE", value: String(orders.filter(o => o.status === "Ready").length).padStart(2, "0"), icon: "check_circle" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--color-surface-container-low)", borderRadius: 14, border: "1px solid rgba(210,196,186,0.15)", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-on-surface-variant)", opacity: 0.7, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: "var(--color-primary)" }}>{s.value}</p>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-secondary)", opacity: 0.5 }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Orders */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 10 }}>
                Pesanan Aktif
                <span style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, animation: "pulse 2s ease-in-out infinite" }}>LIVE</span>
              </h3>
              <span style={{ fontSize: 13, color: "var(--color-secondary)", fontWeight: 600 }}>{active.length} order{active.length !== 1 ? "s" : ""}</span>
            </div>

            {active.length === 0 ? (
              <div style={{ background: "var(--color-surface-container-low)", borderRadius: 16, border: "1px dashed rgba(210,196,186,0.4)", padding: "40px 24px", textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.3, display: "block", marginBottom: 8, color: "var(--color-secondary)" }}>coffee_maker</span>
                <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Belum ada pesanan aktif. Order dari pelanggan akan muncul di sini.</p>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }} className="custom-scrollbar">
                {active.map((order) => {
                  const cfg = STATUS_CFG[order.status];
                  const busy = updating === order.orderId;
                  return (
                    <div key={order.orderId} style={{ minWidth: 290, background: "var(--color-surface-container-lowest)", borderRadius: 16, border: "1px solid rgba(210,196,186,0.2)", padding: 20, flexShrink: 0, transition: "all 0.2s", opacity: busy ? 0.6 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <p style={{ fontWeight: 700, color: "var(--color-primary)" }}>#{order.orderId}</p>
                          <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginTop: 2 }}>
                            {order.tableNumber === "0" ? "Takeaway" : `Table T-${order.tableNumber.padStart(2, "0")}`} • {order.customerName}
                          </p>
                        </div>
                        {cfg && <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, alignSelf: "flex-start" }}>{order.status}</span>}
                      </div>
                      <div style={{ height: 52, overflow: "hidden", marginBottom: 12 }}>
                        {order.items.map((item) => (
                          <p key={item.id} style={{ fontSize: 13, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.quantity}x {item.name}</p>
                        ))}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-secondary)", marginBottom: 12 }}>${formatRupiah(order.total)}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        {cfg && (
                          <button onClick={() => handleAction(order)} disabled={busy} style={{ flex: 1, padding: "10px 16px", background: busy ? "rgba(210,196,186,0.4)" : cfg.actionBg, color: busy ? "var(--color-on-surface-variant)" : cfg.actionColor, fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 10, cursor: busy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            {busy ? <><span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>sync</span>Updating...</> : cfg.actionLabel}
                          </button>
                        )}
                        <button onClick={() => openEditModal(order)} style={{ padding: "10px 16px", background: "var(--color-surface-container)", color: "var(--color-primary)", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 13, fontWeight: 700, border: "1px solid rgba(210,196,186,0.3)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                        </button>
                        <button onClick={() => printReceipt(order)} style={{ padding: "10px 16px", background: "var(--color-surface-container)", color: "var(--color-primary)", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 13, fontWeight: 700, border: "1px solid rgba(210,196,186,0.3)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Table */}
          <div style={{ background: "var(--color-surface-container-lowest)", borderRadius: 20, border: "1px solid rgba(210,196,186,0.15)", overflow: "hidden", marginBottom: 40 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(210,196,186,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-primary)" }}>Riwayat & Data Pelanggan</h3>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.5, pointerEvents: "none" }}>search</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pelanggan atau meja..." style={{ background: "var(--color-surface-container-low)", border: "1px solid rgba(210,196,186,0.25)", borderRadius: 9999, padding: "8px 16px 8px 38px", fontSize: 13, color: "var(--color-primary)", outline: "none", minWidth: 220 }} />
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--color-surface-container-low)", borderBottom: "1px solid rgba(210,196,186,0.2)" }}>
                    {["Customer", "Table", "Order ID", "Status", "Total", "Waktu", "Aksi"].map((h) => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: h === "Waktu" || h === "Aksi" ? "right" : "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-on-surface-variant)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: 14, opacity: 0.6 }}>
                      {search ? "Tidak ada hasil." : "Belum ada order. Order pelanggan akan muncul di sini."}
                    </td></tr>
                  )}
                  {filtered.map((order, i) => {
                    const avatars = [{ bg: "var(--color-primary-fixed)", c: "var(--color-primary)" }, { bg: "var(--color-secondary-fixed)", c: "var(--color-secondary)" }, { bg: "var(--color-tertiary-fixed)", c: "var(--color-tertiary)" }];
                    const av = avatars[i % 3];
                    const d = new Date(order.createdAt);
                    const statusColors: Record<string, { bg: string; c: string }> = {
                      Completed: { bg: "rgba(71,72,54,0.1)", c: "var(--color-on-tertiary-fixed-variant)" },
                      Pending: { bg: "var(--color-error-container)", c: "var(--color-on-error-container)" },
                      Preparing: { bg: "var(--color-secondary-fixed)", c: "var(--color-on-secondary-fixed-variant)" },
                      Ready: { bg: "var(--color-tertiary-fixed)", c: "var(--color-on-tertiary-fixed-variant)" },
                    };
                    const sc = statusColors[order.status] ?? statusColors.Completed;
                    return (
                      <tr key={order.orderId} style={{ borderBottom: "1px solid rgba(210,196,186,0.08)", transition: "background 0.15s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(245,236,231,0.4)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: av.bg, color: av.c, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{initials(order.customerName)}</div>
                            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--color-primary)" }}>{order.customerName}</p>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-secondary)" }}>{order.tableNumber === "0" ? "Takeaway" : `Table ${order.tableNumber}`}</td>
                        <td style={{ padding: "14px 20px" }}><span style={{ fontSize: 12, fontFamily: "monospace", background: "var(--color-surface-container)", padding: "2px 8px", borderRadius: 6, color: "var(--color-on-surface-variant)" }}>#{order.orderId}</span></td>
                        <td style={{ padding: "14px 20px" }}><span style={{ background: sc.bg, color: sc.c, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, textTransform: "uppercase" }}>{order.status}</span></td>
                        <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 700, color: "var(--color-primary)" }}>${formatRupiah(order.total)}</td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{d.toLocaleDateString("id-ID")}</p>
                          <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)", opacity: 0.6 }}>{d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => openEditModal(order)} style={{ background: "var(--color-surface-container)", color: "var(--color-primary)", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, fontWeight: 700, border: "1px solid rgba(210,196,186,0.3)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                              Edit
                            </button>
                            <button onClick={() => printReceipt(order)} style={{ background: "var(--color-surface-container)", color: "var(--color-primary)", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, fontWeight: 700, border: "1px solid rgba(210,196,186,0.3)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
                              Print
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "14px 24px", background: "var(--color-surface-container-low)", borderTop: "1px solid rgba(210,196,186,0.15)" }}>
              <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>Menampilkan {filtered.length} dari {orders.length} order</p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, width: "100%", zIndex: 50, display: "flex", justifyContent: "space-around", padding: "12px 16px", background: "var(--color-surface)", boxShadow: "0 -4px 12px rgba(75,54,33,0.08)" }} className="mobile-only">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", cursor: "pointer", color: activeTab === item.id ? "var(--color-secondary)" : "var(--color-on-surface-variant)", fontWeight: activeTab === item.id ? 700 : 400, padding: "4px 12px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setEditingOrder(null)}>
          <div style={{ background: "var(--color-surface-container-lowest)", borderRadius: 16, padding: 24, maxWidth: 400, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 24, fontWeight: 600, color: "var(--color-primary)", marginBottom: 20 }}>Edit Order</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: 8 }}>Nama Pelanggan</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", fontSize: 14, border: "1px solid rgba(210,196,186,0.3)", borderRadius: 10, background: "var(--color-surface-container-low)", color: "var(--color-primary)", outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: 8 }}>Nomor Meja (0 untuk Takeaway)</label>
              <input
                type="number"
                value={editTable}
                onChange={(e) => setEditTable(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", fontSize: 14, border: "1px solid rgba(210,196,186,0.3)", borderRadius: 10, background: "var(--color-surface-container-low)", color: "var(--color-primary)", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setEditingOrder(null)} style={{ flex: 1, padding: "12px 20px", background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 14, fontWeight: 700, border: "1px solid rgba(210,196,186,0.3)", borderRadius: 10, cursor: "pointer" }}>
                Batal
              </button>
              <button onClick={saveEdit} style={{ flex: 1, padding: "12px 20px", background: "var(--color-secondary)", color: "#fff", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 14, fontWeight: 700, border: "none", borderRadius: 10, cursor: "pointer" }}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .custom-scrollbar::-webkit-scrollbar{height:6px} .custom-scrollbar::-webkit-scrollbar-track{background:transparent} .custom-scrollbar::-webkit-scrollbar-thumb{background:#d2c4ba;border-radius:10px}
        @media(min-width:768px){ .md-sidebar{display:flex!important} .mobile-only{display:none!important} .main-content{margin-left:256px;padding:64px!important} }
      `}</style>
    </div>
  );
}

// ─── Admin Client Component ───────────────────────────────────────────────────

export default function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAuthed(isAuth());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return authed
    ? <AdminDashboard onLogout={() => setAuthed(false)} />
    : <LockScreen onUnlock={() => setAuthed(true)} />;
}
