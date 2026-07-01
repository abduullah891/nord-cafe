export type MenuCategory = "Coffee" | "Non-Coffee" | "Pastries" | "Merchandise";

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: string;
  description: string;
  image: string;
  imageAlt: string;
  badge?: string;
  badgeVariant?: "secondary" | "neutral";
  flavorLabel?: string;
  flavorPercent?: number;
}

export const menuItems: MenuItem[] = [
  // ─── Coffee ───────────────────────────────────────────────────
  {
    id: "signature-cappuccino",
    name: "Signature Cappuccino",
    category: "Coffee",
    price: "Rp 35.000",
    description:
      "Double shot of our house blend with silky micro-foam and a dusting of organic cocoa.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDi7rQHaUeaK2V1pT9GnimcEua9AlTviWnfMIjZ_A5j-D5hALPQb2Rk0Qat4jNqfKizTvBi1ccSfqiz6_EMa4SNGv1r6A5YA6MNv6bRIiHf1piq5fQ7JJKzwKtUyJ-rxwzbkcA0TEVwGtdx-NViC6jEzfzkYh6zL9jPt8i8CsdVln7aQAhIg-X-nAYC8ojBT46fTgCMUFY5gJhQAgxVLp26ByHwi2YepNbasFDwiZPuOQs8FAJloCwn-ScT-nLWoTXX5vKtThklP84",
    imageAlt: "Creamy cappuccino with intricate latte art of a sunset over mountains",
    badge: "Bestseller",
    badgeVariant: "secondary",
    flavorLabel: "Body",
    flavorPercent: 75,
  },
  {
    id: "ethiopian-cold-brew",
    name: "Ethiopian Cold Brew",
    category: "Coffee",
    price: "Rp 28.000",
    description:
      "Slow-steeped for 18 hours. Bright notes of bergamot and jasmine with a crisp finish.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC0LfM-QPDSGh-BaYhoA_OVowiXIDP0hzJE_pjvsAxBvazQqxxmmWoD1rh50qzHYwREeB3JD__mWEQsgT4iv-qAhDK05fjIH08Y1ea21IxbYDpIisJM8pZOb6w9QY9UmuTn3D6eAOb5hZlpbX_1hZTdIgd35Rhe5bSiQWMFs9SVnImyahhcN_diHZ5M2joM3ne2dYl8-1Wfrzh_72SFu1ai6Vg76v58WxUfiR7dV1eBstR6-2zajZU8UfzUrTfBaPjzoiCgLdPLLbc",
    imageAlt: "Crystal clear glass of Iced Americano with large square ice cubes",
    flavorLabel: "Acidity",
    flavorPercent: 90,
  },
  {
    id: "oat-milk-flat-white",
    name: "Oat Milk Flat White",
    category: "Coffee",
    price: "Rp 40.000",
    description:
      "Velvety oat milk paired with our low-acidity 'Sunset' roast. Nutty and smooth.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGsCCDk1Q3v-axYIZwbi8Ss0cl46XJ0Inwl_jzxUbkz1hYkLtWVnQeHTd6i6a1TyF0hNIa3Q3BZ0A9uYLkmgTiDwLZco1kSOvMFrjA6g6Ht38F-FNuMbtxpufgzR2a2XUaKEGPCFx885fLoqg_Z09e-VHVQ_qoOQ4F0WHXhiRbmTcfC41c_-6KXIhPCHgd8-C4LZG5fcEqUz6O7_TgEPbRoH6AMse7BCvCCJEg3DFzC3aBtMwQY8YI_sFi7uT56TRyh2H-PQoxAB8",
    imageAlt: "Oat Milk Flat White in a minimalist white ceramic cup with rosetta latte art",
    badge: "Vegan",
    badgeVariant: "neutral",
    flavorLabel: "Roast Level",
    flavorPercent: 60,
  },

  // ─── Pastries ─────────────────────────────────────────────────
  {
    id: "artisanal-butter-croissant",
    name: "Artisanal Butter Croissant",
    category: "Pastries",
    price: "Rp 25.000",
    description:
      "Three-day fermented dough with French butter. Flaky exterior, honeycomb center.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLcnuAnZh7QfVAFwF_Oiryzrn2ppVFLTtis8qEvxk1m7aa0O9Mu8cFT9yj7M2xdF7mMWPwvaW4sgvcXc2dE_TfyrlGHA_vqejLr7UX2aLuzMMpa7PGqLsxe7alBWWthfNBWfWyUur7MXslKh7Q5yIrMIUU1cIaBklhiXdY9cHJFDsDhogXHSxNWAjs6FObQwfK7pVj-Dp2MrsoRAOJ7RjcwK3w9iIKiqKCrFXRXHu-UZCvTImSensD59OW-bw1giDS5XCpqd2ymfQ",
    imageAlt: "Flaky golden brown butter croissant on parchment paper",
  },
  {
    id: "dark-chocolate-sea-salt",
    name: "Dark Chocolate Sea Salt",
    category: "Pastries",
    price: "Rp 30.000",
    description:
      "72% Valrhona chocolate with flaky Maldon salt. Baked to stay soft and gooey.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqXHxxiww4_7k5Rgb_5dbaXYgAn2BI0jDWGqOh0AOXepr7CiCnLWpsosoX8LgNDPZYoWhdkWtpw1DA0ecNUIl2BbatJrYRGTKJaIa6xfu7yFOq1Iqc9uL54HBMJxk-iH6dk1dYFFCmSxqQhCv3c_mSqn79qPOFhjeVBUpdSk0dND9VicsgX6hgdoJamYWLsdSGHNeQoDC5E4rYr-4Xz5PYPbQG4ipQ6RA9aalyB0bdT23pSK1FGw-wXxLKeV036hwqQ3odxTIMzc8",
    imageAlt: "Thick gooey dark chocolate sea salt cookie with Maldon sea salt",
  },
  {
    id: "lemon-glazed-loaf",
    name: "Lemon Glazed Loaf",
    category: "Pastries",
    price: "Rp 27.000",
    description:
      "Tangy, moist lemon sponge with organic poppyseeds and a zesty sugar glaze.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBt8W17o9iyfNaqSDh9NnJ30LKuQpYB7yJXZPSyO0_GskQniGH9Shjc_aOc_ADQRfDga2DDpZZKUPq6zcZsCVCQvvLpd2BPKpG8R5XP5eM4p0Z2bzGg7giTa3rtBIgZYObdvWyV4Dj9WirLCBupPMhrFdKy6hJtwBy5-9V7tV8A-kbBZaTobiTvghduTey-ZcCztEGfG47Ng32D19xEX5yMQ1HZd26TT5I3B_A6vDi_ftw_IUkbFexy_QVsJtL8sGDfySat3bZCFnk",
    imageAlt: "Slice of lemon poppyseed loaf cake with white glaze and fresh lemon zest",
  },
];

export const menuSections = [
  {
    id: "coffee",
    title: "Coffee Classics",
    subtitle: "Freshly Roasted",
    category: "Coffee" as MenuCategory,
  },
  {
    id: "pastries",
    title: "Handmade Pastries",
    subtitle: "Baked Daily at 5am",
    category: "Pastries" as MenuCategory,
  },
];
