"use client";

import { useState } from "react";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import ProductCard from "./components/ProductCard";
import CartDrawer, { type CartItem } from "./components/CartDrawer";
import { menuItems, menuSections, type MenuCategory } from "./data/menuData";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (item: {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    imageAlt: string;
  }) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((ci) =>
          ci.id === id ? { ...ci, quantity: ci.quantity + delta } : ci
        )
        .filter((ci) => ci.quantity > 0);
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.id !== id));
  };

  const visibleSections = menuSections.filter((section) => {
    if (activeCategory === "All Items") return true;
    return section.category === activeCategory;
  });

  const getItemsForSection = (category: MenuCategory) => {
    return menuItems.filter((item) => item.category === category);
  };

  return (
    <>
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main
        id="menu"
        style={{ maxWidth: "1200px" }}
        className="mx-auto px-4 md:px-16 py-8 md:py-16 pb-24 md:pb-16"
      >
        {/* Page heading */}
        <div className="mb-10">
          <span
            style={{
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "var(--color-secondary)",
              textTransform: "uppercase",
            }}
          >
            What would you like today?
          </span>
          <h2
            style={{
              fontFamily: "'EB Garamond', serif",
              color: "var(--color-primary)",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginTop: 8,
            }}
          >
            Our Menu
          </h2>
        </div>

        {/* Category Filter */}
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

        {/* Menu Sections */}
        {visibleSections.length === 0 && (
          <div className="text-center py-20">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 48, color: "var(--color-outline-variant)" }}
            >
              coffee_maker
            </span>
            <p
              style={{ color: "var(--color-on-surface-variant)", marginTop: 12 }}
              className="text-lg"
            >
              No items in this category yet.
            </p>
          </div>
        )}

        {visibleSections.map((section) => (
          <section key={section.id} id={section.id} className="mb-20">
            {/* Section header */}
            <div
              style={{ borderBottomColor: "rgba(210,196,186,0.2)" }}
              className="flex items-baseline justify-between mb-8 border-b pb-4"
            >
              <h3
                style={{
                  fontFamily: "'EB Garamond', serif",
                  color: "var(--color-primary)",
                  fontSize: "clamp(28px, 4vw, 32px)",
                  fontWeight: 500,
                  lineHeight: 1.25,
                }}
              >
                {section.title}
              </h3>
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {section.subtitle}
              </span>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getItemsForSection(section.category).map((item) => (
                <ProductCard
                  key={item.id}
                  image={item.image}
                  imageAlt={item.imageAlt}
                  price={item.price}
                  name={item.name}
                  description={item.description}
                  badge={item.badge}
                  badgeVariant={item.badgeVariant}
                  flavorLabel={item.flavorLabel}
                  flavorPercent={item.flavorPercent}
                  onAddToCart={() =>
                    handleAddToCart({
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      price: item.price,
                      image: item.image,
                      imageAlt: item.imageAlt,
                    })
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </>
  );
}
