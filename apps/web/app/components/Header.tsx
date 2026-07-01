"use client";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header
      style={{
        backgroundColor: "var(--color-background)",
        borderBottomColor: "rgba(210,196,186,0.1)",
        zIndex: 50,
      }}
      className="w-full sticky top-0 border-b shadow-sm"
    >
      <div
        style={{ maxWidth: "1200px" }}
        className="flex justify-between items-center px-4 md:px-16 py-4 mx-auto"
      >
        {/* Logo */}
        <h1
          style={{
            fontFamily: "'EB Garamond', serif",
            color: "var(--color-secondary)",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        >
          Nord Cafe
        </h1>

        {/* Cart Button */}
        <button
          id="header-cart-btn"
          className="relative p-2 active:scale-95 transition-transform"
          style={{ color: "var(--color-primary)" }}
          onClick={onCartClick}
          aria-label={`Open cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          {cartCount > 0 && (
            <span
              id="cart-badge"
              style={{
                backgroundColor: "var(--color-secondary-container)",
                color: "#fff",
                fontSize: 10,
              }}
              className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center rounded-full font-bold transition-all duration-300"
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
