export default function HeroSection() {
  return (
    <section className="mb-12 md:mb-20 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
      {/* Text */}
      <div className="flex-1 space-y-4">
        <span
          style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--color-secondary)",
            textTransform: "uppercase",
          }}
        >
          The Artisanal Experience
        </span>
        <h2
          style={{
            fontFamily: "'EB Garamond', serif",
            color: "var(--color-primary)",
            fontSize: "clamp(36px, 5vw, 48px)",
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Your morning ritual,{" "}
          <br className="hidden md:inline" />
          perfected at sunset.
        </h2>
        <p
          style={{
            color: "var(--color-on-surface-variant)",
            maxWidth: "xl",
            fontSize: 16,
            lineHeight: "24px",
          }}
          className="max-w-xl mx-auto md:mx-0"
        >
          Each cup is a labor of patience, from bean selection to the final
          pour. Discover our curated selection of roasts and handmade pastries.
        </p>
      </div>

      {/* Image */}
      <div className="flex-1 w-full relative">
        <div
          className="w-full overflow-hidden rounded-xl shadow-xl rotate-1 group transition-transform hover:rotate-0 duration-500"
          style={{ height: 400 }}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMa_6hd6Vq22HW1Gqj1eL12LlAggAA1ch0Ped8sAjT4sl_SKDouESt8C5HGx6_eJ8O3Amx3nSVuKbu3W2rwv2FyH7fX90quhQ5a6IxdebwMp8zepYBn2GGWwAluL31nLsCyhDS0hv1bV93GMkiLHnjMAmNsA9Yasv4UJjzE-OOJj9G4-7A3c2XJ2qwW5gXGFZ_Nrh5Yl5aug6QZqchqusUmTBei5i-yw1sPw7CAuIyiLvw9-IN3DkJhPv65E7cgvZtjvJuqRYPksE"
            alt="Atmospheric coffee shop interior at golden hour with artisanal latte"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Award badge */}
        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: "rgba(144,77,0,0.1)", color: "var(--color-secondary)" }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
            >
              <span className="material-symbols-outlined fill-icon">stars</span>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  color: "var(--color-primary)",
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: "28px",
                }}
              >
                Award Winning
              </p>
              <p
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 14,
                  lineHeight: "20px",
                }}
              >
                Roast of the Year 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
