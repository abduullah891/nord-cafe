"use client";

interface FlavorBarProps {
  label: string;
  percent: number;
}

export function FlavorBar({ label, percent }: FlavorBarProps) {
  return (
    <div className="space-y-2 pt-2">
      <div
        className="flex justify-between"
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--color-outline)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="flavor-bar-segment">
        <div
          className="flavor-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface ProductCardProps {
  image: string;
  imageAlt: string;
  price: string;
  name: string;
  description: string;
  badge?: string;
  badgeVariant?: "secondary" | "neutral";
  flavorLabel?: string;
  flavorPercent?: number;
  onAddToCart?: () => void;
}

export default function ProductCard({
  image,
  imageAlt,
  price,
  name,
  description,
  badge,
  badgeVariant = "secondary",
  flavorLabel,
  flavorPercent,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "rgba(210,196,186,0.1)",
      }}
      className="rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 group"
    >
      {/* Image */}
      <div className="h-64 overflow-hidden relative">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
          <span
            style={{
              color: "var(--color-secondary)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            {price}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h4
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                color: "var(--color-primary)",
                fontSize: 20,
                fontWeight: 600,
                lineHeight: "28px",
              }}
            >
              {name}
            </h4>
            {badge && (
              <div className="flex gap-2 mt-1">
                <span
                  style={
                    badgeVariant === "secondary"
                      ? {
                          backgroundColor: "rgba(144,77,0,0.05)",
                          color: "rgba(144,77,0,0.6)",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }
                      : {
                          backgroundColor: "rgba(51,33,13,0.05)",
                          color: "rgba(78,69,61,0.6)",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }
                  }
                  className="px-2 py-0.5 rounded"
                >
                  {badge}
                </span>
              </div>
            )}
          </div>
        </div>

        <p
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: 14,
            lineHeight: "20px",
          }}
          className="line-clamp-2"
        >
          {description}
        </p>

        {flavorLabel && flavorPercent !== undefined && (
          <FlavorBar label={flavorLabel} percent={flavorPercent} />
        )}

        <button
          id={`add-to-cart-${name.toLowerCase().replace(/ /g, "-")}`}
          onClick={onAddToCart}
          style={{
            backgroundColor: "var(--color-secondary)",
            color: "var(--color-on-secondary)",
          }}
          className="w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 btn-press transition-all hover:opacity-90 active:scale-[0.99]"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            add_shopping_cart
          </span>
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
