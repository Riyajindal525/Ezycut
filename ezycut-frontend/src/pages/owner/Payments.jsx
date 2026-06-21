import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getSalonPayments,
  refundPayment,
} from "../../api/payment.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Wallet, AlertTriangle, CreditCard, ChevronRight, X } from "lucide-react";

const OwnerPayments = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refund Modal States
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchSalonAndPayments = async () => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const paymentsResponse = await getSalonPayments(activeSalonId);
        setPayments(paymentsResponse.payments || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salon transaction ledgers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const handleRefund = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setRefundReason("");
    setRefundModalOpen(true);
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    if (!selectedPaymentId) return;
    setRefundLoading(true);
    try {
      await refundPayment(selectedPaymentId, refundReason);
      toast.success("Refund processed successfully! 🎉. The booking has been cancelled.");
      setRefundModalOpen(false);
      setSelectedPaymentId(null);
      setRefundReason("");
      fetchSalonAndPayments(); // Refresh
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process refund.");
    } finally {
      setRefundLoading(false);
    }
  };

  // Aggregates
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  const netEarnings = totalPaid - totalRefunded;

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "refunded":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  if (loading) {
    return <Loader message="Compiling ledger records..." />;
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
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Gross Earnings</span>
          <div className="mt-6">
            <h3 className="text-3xl font-black text-white">₹{totalPaid}</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-2">Total revenue collected</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Refunded</span>
          <div className="mt-6">
            <h3 className="text-3xl font-black text-white">₹{totalRefunded}</h3>
            <p className="text-xs text-red-400 font-semibold mt-2">Returned transaction funds</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Net Income</span>
          <div className="mt-6">
            <h3 className="text-3xl font-black text-[#fbbf24]">₹{netEarnings}</h3>
            <p className="text-xs text-amber-400 font-semibold mt-2">Net profit after refunds</p>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] shadow-md">
        <h3 className="text-xl font-bold text-white mb-8 pb-3 border-b border-zinc-850 flex items-center gap-2">
          <Wallet size={22} className="text-[#fbbf24]" /> Payment Transactions — {salon?.name}
        </h3>

        {payments.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div style={{
              width: "4rem", height: "4rem", borderRadius: "50%",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
            }}>
              <CreditCard size={24} className="text-zinc-500" />
            </div>
            <h4 className="text-xl font-bold text-zinc-400">No Transactions Recorded</h4>
            <p className="text-zinc-500 mt-1 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
              Any online checkout transactions completed by clients will populate here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-4 pl-2">Customer</th>
                  <th className="pb-4">Service</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Paid Date</th>
                  <th className="pb-4">Payment ID</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-900/35 transition-colors">
                    <td className="py-5 pl-2">
                      <div className="font-bold text-white text-base">{p.customer?.name}</div>
                      <div className="text-xs text-zinc-450 mt-1">{p.customer?.email}</div>
                    </td>
                    <td className="py-5 font-semibold text-zinc-300">{p.service?.name}</td>
                    <td className="py-5 font-black text-[#fbbf24] text-base">₹{p.amount}</td>
                    <td className="py-5 text-zinc-450">{p.paidAt ? new Date(p.paidAt).toLocaleString() : "Pending"}</td>
                    <td className="py-5 font-mono text-xs text-zinc-400">{p.razorpayPaymentId || "N/A"}</td>
                    <td className="py-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getStatusClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-5 text-right pr-2">
                      {p.status === "paid" ? (
                        <button
                          onClick={() => handleRefund(p._id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                        >
                          Issue Refund
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-550 font-semibold italic">Refund unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Styled React Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-start pb-2 border-b border-zinc-850">
              <div className="flex items-center gap-3">
                <div style={{
                  width: "2.5rem", height: "2.5rem", borderRadius: "50%",
                  background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <AlertTriangle size={18} className="text-[#fbbf24]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Issue Refund</h3>
                  <p className="text-xs text-zinc-400 font-semibold">Initiate payment chargeback</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitRefund} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Reason (Optional)</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Salon closed today, customer requested cancellation..."
                  rows="3"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => {
                    setRefundModalOpen(false);
                    setSelectedPaymentId(null);
                    setRefundReason("");
                  }}
                  className="px-5 py-2.5 border border-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundLoading}
                  className="px-6 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  {refundLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Refund"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPayments;
