export default function BottomNav() {
  const navItems = [
    { icon: "local_cafe", label: "Menu", href: "#menu", active: true, fill: true },
    { icon: "list_alt", label: "Orders", href: "#orders", active: false, fill: false },
    { icon: "stars", label: "Rewards", href: "#rewards", active: false, fill: false },
    { icon: "person", label: "Profile", href: "#profile", active: false, fill: false },
  ];

  return (
    <nav
      style={{
        backgroundColor: "var(--color-surface)",
        boxShadow: "0 -4px 12px rgba(75,54,33,0.08)",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom, 12px)",
      }}
      className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 rounded-t-xl"
    >
      {navItems.map((item) => (
        <a
          key={item.label}
          href={item.href}
          id={`bottom-nav-${item.label.toLowerCase()}`}
          style={
            item.active
              ? {
                  color: "var(--color-secondary)",
                  backgroundColor: "rgba(253,139,0,0.2)",
                  fontWeight: 700,
                }
              : { color: "var(--color-on-surface-variant)" }
          }
          className="flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-transform duration-150"
        >
          <span className={`material-symbols-outlined ${item.fill ? "fill-icon" : ""}`}>
            {item.icon}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginTop: 4,
              textTransform: "uppercase",
            }}
          >
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
