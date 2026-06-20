import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import useAuthStore from "../../store/auth.store";

const Header = ({ title }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="dash-header">
      <h1 className="dash-header-title">{title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: "2rem", height: "2rem",
            borderRadius: "50%",
            background: "var(--brand-accent)",
            color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.6875rem", fontWeight: 700,
          }}>
            {user?.name?.slice(0, 2).toUpperCase() || "ME"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-800)" }}>
              {user?.name}
            </span>
            <span style={{ fontSize: "0.6875rem", color: "var(--gray-400)", fontWeight: 500, textTransform: "capitalize" }}>
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ gap: "0.375rem" }}>
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
