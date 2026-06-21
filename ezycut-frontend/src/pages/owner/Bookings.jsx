import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getSalonBookings,
  completeBooking,
  markNoShow,
  ownerCancelBooking,
} from "../../api/booking.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Calendar, User, Phone, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

const OwnerBookings = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Confirmation Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [modalActionFn, setModalActionFn] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSalonAndBookings = async () => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const bookingsResponse = await getSalonBookings(activeSalonId);
        setBookings(bookingsResponse.bookings || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salon appointments ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const triggerActionConfirmation = (bookingId, actionFn, warningText) => {
    setSelectedBookingId(bookingId);
    setModalActionFn(() => actionFn);
    setModalMessage(warningText);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBookingId || !modalActionFn) return;
    setActionLoading(true);
    try {
      await modalActionFn(selectedBookingId);
      toast.success("Booking status updated successfully!");
      setShowConfirmModal(false);
      setSelectedBookingId(null);
      setModalActionFn(null);
      fetchSalonAndBookings(); // Refresh
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update booking status.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-450 border border-blue-500/20";
      case "no_show":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "cancelled_by_customer":
      case "cancelled_by_owner":
        return "bg-red-500/10 text-red-450 border border-red-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  if (loading) {
    return <Loader message="Loading appointments logs..." />;
  }

  if (salons.filter(s => s.owner?._id === user?.id || s.owner === user?.id).length === 0) {
    return (
      <div className="max-w-xl bg-[#121214] p-10 rounded-3xl border border-white/[0.04] shadow-2xl space-y-4 text-white">
        <h3 className="text-xl font-bold">Salon Setup Required</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          You have not registered a salon profile yet. Please complete your salon setup first.
        </p>
        <Link
          to="/owner/dashboard?register=true"
          className="btn btn-primary inline-flex px-6 py-3 text-sm font-bold rounded-xl uppercase tracking-wider"
        >
          Go to Onboarding Form
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white animate-fade-in">
      {/* Header Panel */}
      <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">{salon?.name} Appointments</h3>
          <p className="text-sm text-zinc-400 font-semibold mt-1">View schedules and update reservation statuses</p>
        </div>
        <span className={`self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          salon?.isApproved ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        }`}>
          {salon?.isApproved ? "Approved & Live" : "Pending Review"}
        </span>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] shadow-md">
        {bookings.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div style={{
              width: "4rem", height: "4rem", borderRadius: "50%",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
            }}>
              <Calendar size={24} className="text-zinc-500" />
            </div>
            <h4 className="text-xl font-bold text-zinc-400">No Appointments Logged</h4>
            <p className="text-zinc-500 mt-1 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
              Customers will see slots and book through your salon page once it is live.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-4 pl-2">Customer</th>
                  <th className="pb-4">Contact</th>
                  <th className="pb-4">Service</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Time slot</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-zinc-900/35 transition-colors">
                    <td className="py-5 pl-2">
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: "2rem", height: "2rem", borderRadius: "50%",
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 700, color: "#fbbf24"
                        }}>
                          {b.customer?.name?.slice(0, 2).toUpperCase() || "CU"}
                        </div>
                        <span className="font-bold text-white text-base">{b.customer?.name}</span>
                      </div>
                    </td>
                    <td className="py-5 font-semibold text-zinc-400">{b.customer?.phone || "N/A"}</td>
                    <td className="py-5 font-bold text-zinc-200">{b.service?.name}</td>
                    <td className="py-5 text-zinc-450">{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td className="py-5 font-mono font-bold text-zinc-400">{b.startTime} - {b.endTime}</td>
                    <td className="py-5 font-black text-white text-base">₹{b.totalAmount}</td>
                    <td className="py-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getStatusBadgeClass(b.status)}`}>
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-5 text-right pr-2">
                      {b.status === "confirmed" ? (
                        <div className="inline-flex gap-2 justify-end">
                          <button
                            onClick={() => triggerActionConfirmation(b._id, completeBooking, "Are you sure you want to mark this booking as completed?")}
                            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => triggerActionConfirmation(b._id, markNoShow, "Are you sure you want to mark this client as a No Show?")}
                            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                          >
                            No Show
                          </button>
                          <button
                            onClick={() => triggerActionConfirmation(b._id, ownerCancelBooking, "Cancel this booking? Note: Refund must be processed manually if payment was done.")}
                            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-550 font-semibold italic">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Styled React Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div style={{
                width: "2.5rem", height: "2.5rem", borderRadius: "50%",
                background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <AlertTriangle size={18} className="text-[#fbbf24]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Booking Action</h3>
                <p className="text-xs text-zinc-400 font-semibold">Please review before completing action</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {modalMessage}
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedBookingId(null);
                  setModalActionFn(null);
                }}
                className="px-5 py-2.5 border border-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-800 text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-[#fbbf24] hover:bg-[#eab308] text-zinc-950 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-zinc-950"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
