import { Link } from "react-router-dom";
import { Scissors, MapPin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{
      background: "var(--brand-primary)",
      color: "rgba(255,255,255,0.7)",
      padding: "3rem 0 2rem",
      marginTop: "auto",
    }}>
      <div className="page-container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
          paddingBottom: "2rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <Scissors size={20} style={{ color: "var(--brand-accent)" }} strokeWidth={2.5} />
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
                EzyCut
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, maxWidth: "220px" }}>
              Book salon appointments, track queues in real time and manage your grooming experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quick Links
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { to: "/", label: "Home" },
                { to: "/salons", label: "Explore Salons" },
                { to: "/login", label: "Login" },
                { to: "/register", label: "Register" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => e.target.style.color = "white"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Contact
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <Mail size={14} style={{ flexShrink: 0 }} />
                support@ezycut.in
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <MapPin size={14} style={{ flexShrink: 0 }} />
                India
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8125rem" }}>© 2026 EzyCut. All rights reserved.</span>
          <span style={{ fontSize: "0.8125rem" }}>Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;