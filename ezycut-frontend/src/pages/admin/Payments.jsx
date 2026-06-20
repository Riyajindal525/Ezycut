import { useEffect, useState } from "react";
import {
  getAllPayments,
  refundPayment,
} from "../../api/payment.api";
import toast from "../../utils/toast";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Refund Modal States
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchPaymentsList = async () => {
    try {
      const data = await getAllPayments();
      setPayments(data.payments);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch platform transaction logs ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsList();
  }, []);

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
      toast.success("Refund processed successfully! 🎉");
      setRefundModalOpen(false);
      setSelectedPaymentId(null);
      setRefundReason("");
      fetchPaymentsList(); // Refresh
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process refund.");
    } finally {
      setRefundLoading(false);
    }
  };

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
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 max-w-2xl">
        <h3 className="text-lg font-bold mb-2">Notice</h3>
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800">Global Payments Ledger</h3>
        <p className="text-sm text-gray-400 font-semibold mt-1">Audit all online transaction logs, razorpay references, and issue universal refunds</p>
      </div>

      {/* Transaction Table Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <h4 className="text-xl font-bold text-gray-600">No Transactions Found</h4>
            <p className="text-gray-400 mt-1 text-sm font-semibold">Platform transactions ledger is currently empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Salon & Service</th>
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
                    <td className="py-4">
                      <div className="font-semibold text-gray-700">{p.salon?.name || "N/A"}</div>
                      <div className="text-xs text-gray-400 font-semibold mt-0.5">{p.service?.name}</div>
                    </td>
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
                          Universal Refund
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold italic">No actions available</span>
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
                  placeholder="e.g. Booking cancelled, duplicate transaction..."
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

export default AdminPayments;
