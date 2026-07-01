export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-surface-container-low)",
        borderTopColor: "rgba(210,196,186,0.2)",
      }}
      className="hidden md:block border-t py-16 mt-20"
    >
      <div
        style={{ maxWidth: "1200px" }}
        className="mx-auto px-16 grid grid-cols-4 gap-12"
      >
        {/* Brand */}
        <div className="col-span-2 space-y-6">
          <h2
            style={{
              fontFamily: "'EB Garamond', serif",
              color: "var(--color-secondary)",
              fontSize: 32,
              fontWeight: 500,
            }}
          >
            Kopi Senja
          </h2>
          <p style={{ color: "var(--color-on-surface-variant)", maxWidth: 320, fontSize: 16 }}>
            Crafting moments of peace in the heart of the city. Join our
            community of coffee lovers.
          </p>
          <div className="flex gap-4">
            <SocialBtn icon="alternate_email" href="#" label="Email" />
            <SocialBtn icon="share" href="#" label="Share" />
          </div>
        </div>

        {/* Explore */}
        <FooterLinkGroup
          title="Explore"
          links={["Our Story", "Sustainability", "Locations", "Careers"]}
        />

        {/* Support */}
        <FooterLinkGroup
          title="Support"
          links={["Help Center", "Privacy Policy", "Terms of Use", "Cookie Settings"]}
        />
      </div>

      {/* Bottom bar */}
      <div
        style={{ maxWidth: "1200px", borderTopColor: "rgba(210,196,186,0.1)" }}
        className="mx-auto px-16 mt-16 pt-8 border-t text-center"
      >
        <p
          style={{
            color: "var(--color-outline)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          © 2024 Kopi Senja Coffee House. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function SocialBtn({ icon, href, label }: { icon: string; href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      style={{ color: "var(--color-primary)", backgroundColor: "rgba(51,33,13,0.05)" }}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-[--color-secondary] hover:text-white"
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = "var(--color-secondary)";
        el.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = "rgba(51,33,13,0.05)";
        el.style.color = "var(--color-primary)";
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
        {icon}
      </span>
    </a>
  );
}

function FooterLinkGroup({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h5
        style={{
          color: "var(--color-primary)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        {title}
      </h5>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              style={{ color: "var(--color-on-surface-variant)", fontWeight: 500 }}
              className="transition-colors duration-200"
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--color-secondary)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--color-on-surface-variant)")
              }
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
