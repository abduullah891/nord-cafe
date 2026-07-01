"use client";

import { useState } from "react";

const categories = ["All Items", "Coffee", "Non-Coffee", "Pastries", "Merchandise"];

export default function CategoryFilter({
  active,
  onChange,
}: {
  active: string;
  onChange: (cat: string) => void;
}) {
  return (
    <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
      {categories.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            id={`filter-${cat.toLowerCase().replace(/ /g, "-")}`}
            onClick={() => onChange(cat)}
            style={
              isActive
                ? {
                    backgroundColor: "var(--color-secondary)",
                    color: "var(--color-on-secondary)",
                  }
                : {
                    backgroundColor: "rgba(51,33,13,0.05)",
                    color: "var(--color-on-surface-variant)",
                  }
            }
            className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all active:scale-95 ${
              isActive ? "shadow-md" : "hover:bg-[rgba(51,33,13,0.1)]"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
