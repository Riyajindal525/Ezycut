import { Link } from "react-router-dom";
import { MapPin, Star, ArrowRight } from "lucide-react";

const SalonCard = ({ salon }) => {
  return (
    <div className="card card-hover" style={{ overflow: "hidden" }}>
      {/* Header gradient */}
      <div style={{
        height: "120px",
        background: "linear-gradient(135deg, var(--brand-primary) 0%, #312e81 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}>
        {/* Rating badge */}
        <div style={{
          position: "absolute", top: "0.75rem", right: "0.75rem",
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "var(--radius-full)",
          padding: "0.25rem 0.625rem",
          display: "flex", alignItems: "center", gap: "0.25rem",
          color: "white", fontSize: "0.8125rem", fontWeight: 700,
        }}>
          <Star size={12} fill="currentColor" style={{ color: "#fbbf24" }} />
          {salon.rating || "New"}
        </div>

        {/* Salon name initial */}
        <div style={{
          width: "3.5rem", height: "3.5rem",
          borderRadius: "var(--radius-md)",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.25rem", fontWeight: 800, color: "white",
          border: "2px solid rgba(255,255,255,0.2)",
        }}>
          {salon.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "1.25rem" }}>
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--gray-800)", marginBottom: "0.375rem" }}>
          {salon.name}
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--gray-500)", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
          <MapPin size={12} />
          {salon.address}, {salon.city}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{
            flex: 1, background: "var(--gray-50)", borderRadius: "var(--radius)",
            padding: "0.5rem", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.6875rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Reviews</div>
            <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--gray-700)", marginTop: "0.125rem" }}>{salon.totalReviews || 0}</div>
          </div>
          <div style={{
            flex: 1, background: "var(--gray-50)", borderRadius: "var(--radius)",
            padding: "0.5rem", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.6875rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Hours</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-700)", marginTop: "0.125rem" }}>
              {salon.openingTime} – {salon.closingTime}
            </div>
          </div>
        </div>

        <Link
          to={`/salons/${salon._id}`}
          className="btn btn-primary btn-full"
          style={{ gap: "0.375rem" }}
        >
          View Details
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default SalonCard;