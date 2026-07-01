"use client";

import { useState, useEffect, useCallback } from "react";

// ── Shared localStorage helpers (mirrors apps/admin/src/lib/store.ts) ──
const STORAGE_KEY = "nord_cafe_orders";

function generateOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `NC-${num}`;
}

function saveOrderToStore(order: {
  orderId: string;
  customerName: string;
  tableNumber: string;
  items: { id: string; name: string; description: string; price: string; quantity: number; image: string }[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // silently fail if localStorage unavailable
  }
}

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  imageAlt: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

type OrderState = "idle" | "processing" | "success";

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderState, setOrderState] = useState<OrderState>("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const parsePrice = (priceStr: string) =>
    parseFloat(priceStr.replace(/[^0-9]/g, ""));

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = useCallback(() => {
    if (!customerName.trim() || !tableNumber.trim()) {
      const nameInput = document.getElementById("drawer-customer-name");
      const tableInput = document.getElementById("drawer-table-number");
      if (!customerName.trim()) nameInput?.focus();
      else tableInput?.focus();

      // Shake animation
      const target = !customerName.trim() ? nameInput : tableInput;
      target?.classList.add("ring-2");
      target?.style.setProperty("border-color", "var(--color-error)");
      setTimeout(() => {
        target?.classList.remove("ring-2");
        target?.style.removeProperty("border-color");
      }, 1500);
      return;
    }

    setOrderState("processing");

    // Build and persist order to localStorage → admin dashboard reads this
    const now = new Date().toISOString();
    const order = {
      orderId: generateOrderId(),
      customerName: customerName.trim(),
      tableNumber: tableNumber.trim(),
      items: cartItems.map((ci) => ({
        id: ci.id,
        name: ci.name,
        description: ci.description,
        price: ci.price,
        quantity: ci.quantity,
        image: ci.image,
      })),
      subtotal,
      tax,
      total,
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    };
    saveOrderToStore(order);

    setTimeout(() => {
      setOrderState("success");
      setTimeout(() => {
        setOrderState("idle");
        onClose();
        setCustomerName("");
        setTableNumber("");
      }, 2000);
    }, 1500);
  }, [customerName, tableNumber, cartItems, subtotal, tax, total, onClose]);


  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(30, 27, 24, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "min(520px, 100vw)",
          backgroundColor: "var(--color-background)",
          zIndex: 101,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(75, 54, 33, 0.15)",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            borderBottomColor: "rgba(210,196,186,0.2)",
            flexShrink: 0,
          }}
          className="flex items-center justify-between px-6 py-5 border-b"
        >
          <div>
            <p
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-secondary)",
              }}
            >
              Your Order
            </p>
            <h2
              style={{
                fontFamily: "'EB Garamond', serif",
                fontSize: 28,
                fontWeight: 600,
                color: "var(--color-primary)",
                lineHeight: 1.2,
              }}
            >
              {itemCount === 0
                ? "Cart is Empty"
                : `${itemCount} Item${itemCount !== 1 ? "s" : ""} Selected`}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              color: "var(--color-on-surface-variant)",
              backgroundColor: "var(--color-surface-container)",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor =
                "var(--color-surface-container-high)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor =
                "var(--color-surface-container)")
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{ overflowY: "auto", flex: 1, padding: "24px" }}
          className="no-scrollbar"
        >
          {cartItems.length === 0 ? (
            /* Empty state */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: 300,
                color: "var(--color-on-surface-variant)",
                textAlign: "center",
                gap: 16,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 64,
                  color: "var(--color-outline-variant)",
                  opacity: 0.6,
                }}
              >
                shopping_cart
              </span>
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 24,
                  fontWeight: 500,
                  color: "var(--color-primary)",
                }}
              >
                Nothing here yet
              </p>
              <p style={{ fontSize: 14, lineHeight: "20px" }}>
                Add items from the menu to get started.
              </p>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: "var(--color-secondary-container)",
                  color: "#fff",
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  padding: "12px 28px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  marginTop: 8,
                }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Cart Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p
                  style={{
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-on-tertiary-fixed-variant)",
                  }}
                >
                  Review Your Items
                </p>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: "var(--color-surface-container-lowest)",
                      borderColor: "rgba(210,196,186,0.15)",
                      borderRadius: 16,
                      border: "1px solid",
                      padding: "16px",
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      boxShadow: "0 4px 16px rgba(75, 54, 33, 0.06)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 8px 24px rgba(75, 54, 33, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 4px 16px rgba(75, 54, 33, 0.06)";
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        backgroundImage: `url('${item.image}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        flexShrink: 0,
                      }}
                    />

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <h3
                            style={{
                              fontFamily: "'Be Vietnam Pro', sans-serif",
                              fontSize: 15,
                              fontWeight: 600,
                              color: "var(--color-primary)",
                              lineHeight: "20px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.name}
                          </h3>
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--color-on-surface-variant)",
                              marginTop: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.description}
                          </p>
                        </div>
                        <span
                          style={{
                            fontFamily: "'Be Vietnam Pro', sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "var(--color-secondary)",
                            flexShrink: 0,
                          }}
                        >
                          {formatRupiah(parsePrice(item.price) * item.quantity)}
                        </span>
                      </div>

                      {/* Quantity & Remove */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginTop: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "var(--color-surface-container-high)",
                            borderRadius: 9999,
                            border: "1px solid rgba(210,196,186,0.3)",
                            padding: "2px 8px",
                          }}
                        >
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--color-on-surface-variant)",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center",
                              borderRadius: 4,
                              transition: "color 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.color =
                                "var(--color-secondary)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.color =
                                "var(--color-on-surface-variant)")
                            }
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 16 }}
                            >
                              remove
                            </span>
                          </button>
                          <span
                            style={{
                              fontFamily: "'Be Vietnam Pro', sans-serif",
                              fontWeight: 700,
                              fontSize: 14,
                              color: "var(--color-primary)",
                              minWidth: 24,
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--color-on-surface-variant)",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center",
                              borderRadius: 4,
                              transition: "color 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.color =
                                "var(--color-secondary)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.color =
                                "var(--color-on-surface-variant)")
                            }
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 16 }}
                            >
                              add
                            </span>
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--color-on-surface-variant)",
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              "var(--color-error)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              "var(--color-on-surface-variant)")
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bento Info Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div
                  style={{
                    backgroundColor: "var(--color-surface-container-low)",
                    borderColor: "rgba(210,196,186,0.2)",
                    border: "1px solid",
                    borderRadius: 12,
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-on-tertiary-fixed-variant)",
                    }}
                  >
                    Est. Preparation
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "var(--color-secondary)", fontSize: 20 }}
                    >
                      schedule
                    </span>
                    <span
                      style={{
                        fontFamily: "'EB Garamond', serif",
                        fontSize: 22,
                        fontWeight: 600,
                        color: "var(--color-primary)",
                      }}
                    >
                      8-12 min
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "var(--color-surface-container-low)",
                    borderColor: "rgba(210,196,186,0.2)",
                    border: "1px solid",
                    borderRadius: 12,
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-on-tertiary-fixed-variant)",
                    }}
                  >
                    Current Rewards
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <span
                      className="material-symbols-outlined fill-icon"
                      style={{ color: "var(--color-secondary)", fontSize: 20 }}
                    >
                      stars
                    </span>
                    <span
                      style={{
                        fontFamily: "'EB Garamond', serif",
                        fontSize: 22,
                        fontWeight: 600,
                        color: "var(--color-primary)",
                      }}
                    >
                      450 pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div
                style={{
                  backgroundColor: "var(--color-surface-container-high)",
                  borderRadius: 16,
                  padding: "24px",
                  border: "1px solid rgba(210,196,186,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <h3
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    borderBottom: "1px solid rgba(210,196,186,0.2)",
                    paddingBottom: 12,
                  }}
                >
                  Checkout
                </h3>

                {/* Name Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label
                    htmlFor="drawer-customer-name"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    Customer Name
                  </label>
                  <input
                    id="drawer-customer-name"
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{
                      width: "100%",
                      backgroundColor: "var(--color-surface-container-lowest)",
                      border: "1px solid var(--color-outline-variant)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      fontSize: 15,
                      color: "var(--color-primary)",
                      fontFamily: "'Be Vietnam Pro', sans-serif",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--color-secondary)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(144,77,0,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-outline-variant)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Table Number Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label
                    htmlFor="drawer-table-number"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    Table Number
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 20,
                        color: "var(--color-on-surface-variant)",
                        pointerEvents: "none",
                      }}
                    >
                      restaurant
                    </span>
                    <input
                      id="drawer-table-number"
                      type="number"
                      placeholder="00"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "var(--color-surface-container-lowest)",
                        border: "1px solid var(--color-outline-variant)",
                        borderRadius: 10,
                        padding: "14px 16px 14px 48px",
                        fontSize: 15,
                        color: "var(--color-primary)",
                        fontFamily: "'Be Vietnam Pro', sans-serif",
                        outline: "none",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--color-secondary)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(144,77,0,0.12)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          "var(--color-outline-variant)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Price Summary */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        color: "var(--color-on-surface-variant)",
                      }}
                    >
                      Subtotal
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        color: "var(--color-on-surface-variant)",
                        fontFamily: "'Be Vietnam Pro', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        color: "var(--color-on-surface-variant)",
                      }}
                    >
                      Tax (8%)
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        color: "var(--color-on-surface-variant)",
                        fontFamily: "'Be Vietnam Pro', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {formatRupiah(tax)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid rgba(210,196,186,0.3)",
                      paddingTop: 12,
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Be Vietnam Pro', sans-serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--color-primary)",
                      }}
                    >
                      Total Amount
                    </span>
                    <span
                      style={{
                        fontFamily: "'EB Garamond', serif",
                        fontSize: 28,
                        fontWeight: 600,
                        color: "var(--color-secondary)",
                        lineHeight: 1,
                      }}
                    >
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer CTA */}
        {cartItems.length > 0 && (
          <div
            style={{
              flexShrink: 0,
              padding: "20px 24px",
              borderTop: "1px solid rgba(210,196,186,0.2)",
              backgroundColor: "var(--color-background)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <button
              id="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={orderState !== "idle"}
              style={{
                width: "100%",
                backgroundColor:
                  orderState === "success"
                    ? "#c8c8b0"
                    : "var(--color-secondary-container)",
                color:
                  orderState === "success"
                    ? "var(--color-on-tertiary-fixed-variant)"
                    : "#fff",
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                padding: "18px 24px",
                borderRadius: 14,
                border: "none",
                cursor: orderState === "idle" ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                transition: "all 0.3s ease",
                boxShadow:
                  orderState === "idle"
                    ? "0 4px 20px rgba(253,139,0,0.3)"
                    : "none",
                transform: "translateY(0)",
              }}
              onMouseEnter={(e) => {
                if (orderState === "idle") {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--color-secondary)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 8px 28px rgba(144,77,0,0.35)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (orderState === "idle") {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--color-secondary-container)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 20px rgba(253,139,0,0.3)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                }
              }}
              onMouseDown={(e) => {
                if (orderState === "idle") {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(1px)";
                }
              }}
              onMouseUp={(e) => {
                if (orderState === "idle") {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                }
              }}
            >
              {orderState === "idle" && (
                <>
                  Place Order
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    trending_flat
                  </span>
                </>
              )}
              {orderState === "processing" && (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      animation: "spin 1s linear infinite",
                    }}
                  >
                    sync
                  </span>
                  Processing...
                </>
              )}
              {orderState === "success" && (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    check_circle
                  </span>
                  Order Placed!
                </>
              )}
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--color-on-surface-variant)",
                opacity: 0.7,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              By placing this order, you agree to our Terms of Service.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
