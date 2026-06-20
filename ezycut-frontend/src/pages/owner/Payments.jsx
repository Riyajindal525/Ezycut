import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { getAllSalons } from "../../api/salon.api";
import {
  getSalonPayments,
  refundPayment,
} from "../../api/payment.api";
import toast from "../../utils/toast";

const OwnerPayments = () => {
  const user = useAuthStore((state) => state.user);
  const [salon, setSalon] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Refund Modal States
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchSalonAndPayments = async () => {
    try {
      const salonsResponse = await getAllSalons();
      const ownerSalon = salonsResponse.salons.find(
        (s) => s.owner?._id === user?.id || s.owner === user?.id
      );

      if (ownerSalon) {
        setSalon(ownerSalon);
        const paymentsResponse = await getSalonPayments(ownerSalon._id);
        setPayments(paymentsResponse.payments);
      } else {
        setError("register_needed");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching salon transaction details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      toast.success("Refund processed successfully! 🎉. The associated booking has been cancelled.");
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
        return "bg-green-50 text-green-600 border border-green-100";
      case "refunded":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "failed":
        return "bg-red-50 text-red-600 border border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Salon Setup Required</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {error === "register_needed"
            ? "You have not registered a salon profile yet. Please complete your salon setup first."
            : error}
        </p>
        {error === "register_needed" && (
          <Link
            to="/owner/dashboard"
            className="inline-block px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Go to Dashboard Setup
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Gross Earnings</span>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800">₹{totalPaid}</h3>
            <p className="text-xs text-green-500 font-semibold mt-1">Total revenue collected</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Refunded</span>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800">₹{totalRefunded}</h3>
            <p className="text-xs text-red-500 font-semibold mt-1">Returned transaction funds</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Net Income</span>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-blue-600">₹{netEarnings}</h3>
            <p className="text-xs text-blue-500 font-semibold mt-1">Net profit after refunds</p>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Payment Transactions — {salon?.name}
        </h3>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <h4 className="text-xl font-bold text-gray-600">No Transactions Found</h4>
            <p className="text-gray-400 mt-1 text-sm font-semibold">Any online appointment checkout transactions will populate this ledger.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Paid Date</th>
                  <th className="pb-3">Payment ID</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-gray-800">{p.customer?.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.customer?.email}</div>
                    </td>
                    <td className="py-4 font-semibold">{p.service?.name}</td>
                    <td className="py-4 font-bold text-gray-800">₹{p.amount}</td>
                    <td className="py-4">{p.paidAt ? new Date(p.paidAt).toLocaleString() : "Pending"}</td>
                    <td className="py-4 font-mono text-xs">{p.razorpayPaymentId || "N/A"}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {p.status === "paid" ? (
                        <button
                          onClick={() => handleRefund(p._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-colors"
                        >
                          Issue Refund
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold italic">Refund unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Issue Refund</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Please provide a reason for initiating this refund</p>
            </div>

            <form onSubmit={submitRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Reason (Optional)</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Salon closed today, customer requested cancellation..."
                  rows="3"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setRefundModalOpen(false);
                    setSelectedPaymentId(null);
                    setRefundReason("");
                  }}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-50 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundLoading}
                  className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5"
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
