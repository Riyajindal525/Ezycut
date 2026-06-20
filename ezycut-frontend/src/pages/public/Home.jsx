import { Link } from "react-router-dom";
import { Search, Clock, Star, ArrowRight, Scissors, CheckCircle } from "lucide-react";
import useAuthStore from "../../store/auth.store";

const features = [
  {
    icon: Search,
    title: "Discover Salons",
    description: "Browse verified salons near you with real reviews and ratings.",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    icon: Clock,
    title: "Real-Time Queue",
    description: "Track your position in queue live and arrive right on time.",
    color: "#10b981",
    bg: "#d1fae5",
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description: "Make informed decisions with authentic customer feedback.",
    color: "#f59e0b",
    bg: "#fef3c7",
  },
];

const steps = [
  { num: "01", title: "Choose a Salon", desc: "Browse and find the perfect salon." },
  { num: "02", title: "Pick a Service", desc: "Select from the services offered." },
  { num: "03", title: "Book & Pay Online", desc: "Instant confirmation via Razorpay." },
  { num: "04", title: "Skip the Wait", desc: "Track queue and arrive on time." },
];

const Home = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Hero Section */}
      <section style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        padding: "6rem 0 5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative gradient blob */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "-60px",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div className="page-container" style={{ position: "relative", textAlign: "center" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "var(--radius-full)", padding: "0.375rem 0.875rem",
            fontSize: "0.8125rem", fontWeight: 600, color: "#a5b4fc",
            marginBottom: "1.5rem",
          }}>
            <Scissors size={14} />
            India's Smart Salon Booking Platform
          </div>

          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 900,
            color: "white",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            maxWidth: "720px",
            margin: "0 auto 1.5rem",
          }}>
            Book Salon Appointments{" "}
            <span style={{
              background: "linear-gradient(135deg, #818cf8, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Without Waiting
            </span>
          </h1>

          <p style={{
            fontSize: "1.125rem",
            color: "rgba(255,255,255,0.65)",
            maxWidth: "560px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}>
            Discover top-rated salons, book appointments in seconds, track your queue in real time — all from one place.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/salons" className="btn btn-accent btn-lg" style={{ gap: "0.5rem" }}>
              Explore Salons
              <ArrowRight size={18} />
            </Link>
            {!token && (
              <Link to="/register" className="btn btn-lg" style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.2)",
              }}>
                Create Free Account
              </Link>
            )}
            {token && user?.role === "customer" && (
              <Link to="/my-bookings" className="btn btn-lg" style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.2)",
              }}>
                My Bookings
              </Link>
            )}
          </div>

          {/* Trust bar */}
          <div style={{
            marginTop: "3rem",
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}>
            {["10,000+ Customers", "500+ Salons", "Secure Payments", "Live Queue Tracking"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", fontWeight: 500 }}>
                <CheckCircle size={14} style={{ color: "#10b981" }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "5rem 0" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--gray-800)", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              Everything You Need
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "1rem", maxWidth: "480px", margin: "0 auto" }}>
              From discovery to post-visit review — EzyCut handles the entire journey.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="card card-hover" style={{ padding: "2rem" }}>
                <div style={{
                  width: "3rem", height: "3rem",
                  borderRadius: "var(--radius-md)",
                  background: bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1.25rem",
                }}>
                  <Icon size={22} style={{ color }} strokeWidth={2} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--gray-800)", marginBottom: "0.5rem" }}>
                  {title}
                </h3>
                <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "5rem 0", background: "white" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--gray-800)", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              How It Works
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "1rem" }}>
              From browsing to booking in under 60 seconds.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {steps.map(({ num, title, desc }) => (
              <div key={num} style={{ textAlign: "center", padding: "1.5rem" }}>
                <div style={{
                  width: "3.5rem", height: "3.5rem",
                  borderRadius: "50%",
                  background: "var(--brand-primary)",
                  color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.25rem",
                  fontSize: "0.9375rem", fontWeight: 800,
                }}>
                  {num}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--gray-800)", marginBottom: "0.5rem" }}>
                  {title}
                </h3>
                <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", lineHeight: 1.65 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        padding: "5rem 0",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        textAlign: "center",
      }}>
        <div className="page-container">
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "1rem" }}>
            Ready to Book Your Next Appointment?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.0625rem", marginBottom: "2rem" }}>
            Join thousands of satisfied customers using EzyCut every day.
          </p>

          {!token ? (
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" className="btn btn-lg" style={{ background: "white", color: "var(--brand-accent)", fontWeight: 700 }}>
                Join EzyCut — It's Free
              </Link>
              <Link to="/salons" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                Browse Salons
              </Link>
            </div>
          ) : (
            <Link to="/salons" className="btn btn-lg" style={{ background: "white", color: "var(--brand-accent)", fontWeight: 700, gap: "0.5rem" }}>
              Explore Salons
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;