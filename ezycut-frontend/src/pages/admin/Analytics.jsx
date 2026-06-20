import { useEffect, useState } from "react";
import {
  getNetRevenue,
  getPlatformMonthlyRevenue,
} from "../../api/payment.api";

const AdminAnalytics = () => {
  const [netRevenue, setNetRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [netData, monthlyData] = await Promise.all([
          getNetRevenue(),
          getPlatformMonthlyRevenue(),
        ]);

        setNetRevenue(netData.revenue);
        setMonthlyRevenue(monthlyData.revenue || []);
      } catch (err) {
        console.error(err);
        setError("Error loading system revenue analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("default", { month: "long" });
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

  const maxRevenue = monthlyRevenue.length > 0
    ? Math.max(...monthlyRevenue.map((m) => m.revenue))
    : 1;

  return (
    <div className="space-y-6">
      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Gross Platform Sales</span>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800">₹{netRevenue?.paidRevenue || 0}</h3>
            <p className="text-xs text-green-500 font-semibold mt-1">Total transactions captured</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Platform Refunds</span>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800">₹{netRevenue?.refundedRevenue || 0}</h3>
            <p className="text-xs text-red-500 font-semibold mt-1">Total returned to clients</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Net Platform Earnings</span>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-blue-600">₹{netRevenue?.netRevenue || 0}</h3>
            <p className="text-xs text-blue-500 font-semibold mt-1">Earnings net after refunds</p>
          </div>
        </div>
      </div>

      {/* Monthly Chart Bar Comparison */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Revenue Comparisons ({new Date().getFullYear()})</h3>

        {monthlyRevenue.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No completed sales aggregates recorded for this calendar year.
          </div>
        ) : (
          <div className="space-y-6">
            {monthlyRevenue.map((m, idx) => {
              const pct = (m.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-gray-700">{getMonthName(m._id.month)}</span>
                    <span className="text-gray-800">
                      ₹{m.revenue} <span className="text-gray-400 text-xs font-semibold">({m.bookings} bookings)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
