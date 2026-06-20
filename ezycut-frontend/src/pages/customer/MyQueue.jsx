import { useEffect, useState } from "react";
import { Clock, Hash, Timer, Key, Scissors, RefreshCw } from "lucide-react";
import { getMyQueue } from "../../api/queue.api";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import toast from "../../utils/toast";

const MyQueue = () => {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchQueue = async (silent = false) => {
    try {
      const data = await getMyQueue();
      const activeQueue = data.queues?.find(
        (q) => q.status === "waiting" || q.status === "in_service"
      );
      setQueue(activeQueue || null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!silent) toast.error("Failed to load queue status.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    const interval = setInterval(() => fetchQueue(true), 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader message="Loading your queue status..." />;

  const isInService = queue?.status === "in_service";

  return (
    <div style={{ padding: "2rem 0" }}>
      <div className="page-container" style={{ maxWidth: "680px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title">My Queue</h1>
            <p style={{ color: "var(--gray-500)", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <RefreshCw size={13} />
              Auto-refreshing every 15 seconds
              {lastUpdated && (
                <span style={{ marginLeft: "0.375rem" }}>
                  · Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => fetchQueue()}
            className="btn btn-outline btn-sm"
            style={{ gap: "0.375rem" }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {!queue ? (
          <EmptyState
            title="No active queue"
            description='You are not currently in any queue. Go to "My Bookings" and click "Join Queue" to check in.'
            icon={Clock}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Status Banner */}
            <div style={{
              background: isInService
                ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                : "linear-gradient(135deg, var(--brand-primary), #312e81)",
              borderRadius: "var(--radius-xl)",
              padding: "2rem",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", right: "-40px", top: "-40px",
                width: "200px", height: "200px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "50%",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                    {queue.salon?.name}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Scissors size={13} />
                    {queue.service?.name}
                  </p>
                </div>

                <span style={{
                  background: isInService ? "rgba(255,255,255,0.2)" : "rgba(251,191,36,0.25)",
                  border: `1px solid ${isInService ? "rgba(255,255,255,0.3)" : "rgba(251,191,36,0.4)"}`,
                  borderRadius: "var(--radius-full)",
                  padding: "0.375rem 0.875rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: isInService ? "white" : "#fde68a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {isInService ? "✂ In Service" : "⏳ Waiting"}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              {[
                { label: "Token #", value: `#${queue.tokenNumber}`, icon: Hash, color: "var(--brand-accent)" },
                { label: "Position", value: isInService ? "Serving" : queue.position, icon: Clock, color: "var(--success)" },
                { label: "Est. Wait", value: `${queue.estimatedWaitTime}m`, icon: Timer, color: "var(--warning)" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="stat-card" style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div className="stat-value" style={{ fontSize: "1.5rem", color }}>
                    {value}
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Token Code */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Key size={18} style={{ color: "var(--brand-accent)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gray-400)", marginBottom: "0.25rem" }}>
                    Token Code
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: "1.125rem", fontWeight: 800, color: "var(--gray-800)", letterSpacing: "0.1em" }}>
                    {queue.tokenCode}
                  </div>
                </div>
              </div>

              {queue.joinedAt && (
                <div style={{ marginTop: "0.875rem", paddingTop: "0.875rem", borderTop: "1px solid var(--gray-100)", fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                  Joined at {new Date(queue.joinedAt).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" })}
                </div>
              )}
            </div>

            {isInService && (
              <div style={{
                background: "var(--success-light)",
                border: "1px solid #a7f3d0",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                color: "#065f46",
                fontWeight: 600,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
              }}>
                ✂ You are currently being served. Please stay at the salon.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQueue;