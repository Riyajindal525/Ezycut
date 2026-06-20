import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";

const titleMap = {
  dashboard: "Dashboard Overview",
  bookings: "Appointments",
  services: "Services Catalog",
  queue: "Live Queue",
  payments: "Earnings",
};

const getTitle = (path) => {
  const segment = path.split("/").pop();
  return titleMap[segment] || "Owner Panel";
};

const OwnerLayout = () => {
  const location = useLocation();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Header title={getTitle(location.pathname)} />
        <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;