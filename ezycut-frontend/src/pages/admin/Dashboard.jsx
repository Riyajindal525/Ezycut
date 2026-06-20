import { useEffect, useState } from "react";
import {
  getAdminOverview,
  getAdminRecentSalons,
  getAdminRecentUsers,
  getAdminTopSalons,
} from "../../api/dashboard.api";

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [recentSalons, setRecentSalons] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topSalons, setTopSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [overviewData, salonsData, usersData, topSalonsData] = await Promise.all([
          getAdminOverview(),
          getAdminRecentSalons(),
          getAdminRecentUsers(),
          getAdminTopSalons(),
        ]);

        setOverview(overviewData.overview);
        setRecentSalons(salonsData.salons);
        setRecentUsers(usersData.users);
        setTopSalons(topSalonsData.salons || []);
      } catch (err) {
        console.error(err);
        setError("Error loading system metrics overview.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

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
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800">₹{overview?.totalRevenue || 0}</h3>
            <p className="text-xs text-green-500 font-semibold mt-1">Platform gross sales</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Registered Users</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800">{overview?.totalUsers || 0}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Customers ({overview?.totalCustomers}) | Owners ({overview?.totalSalonOwners})
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Salons Registered</span>
            <span className="text-2xl">🏪</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800">{overview?.totalSalons || 0}</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Approved ({overview?.approvedSalons}) | Pending ({overview?.pendingSalons})
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Bookings</span>
            <span className="text-2xl">📅</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800">{overview?.totalBookings || 0}</h3>
            <p className="text-xs text-blue-500 font-semibold mt-1">
              Completed ({overview?.completedBookings})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Salons Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 font-semibold">Recent Salon Profiles</h3>
          {recentSalons.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No recent salons registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                    <th className="pb-3">Salon Name</th>
                    <th className="pb-3">Owner</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-600">
                  {recentSalons.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-semibold text-gray-800">{s.name}</td>
                      <td className="py-3">{s.owner?.name || "Unassigned"}</td>
                      <td className="py-3">{s.city}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${s.isApproved ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                          {s.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Users Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 font-semibold">Recent User Signups</h3>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No recent signups recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                    <th className="pb-3">User Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-600">
                  {recentUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-semibold text-gray-800">{u.name}</td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${u.role === "admin" ? "bg-red-50 text-red-600" : u.role === "salon_owner" ? "bg-purple-50 text-purple-600" : "bg-slate-100 text-slate-600"}`}>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Salons Leaderboard */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800 font-semibold">Top Performing Salons Leaderboard</h3>
        {topSalons.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No top salon statistics available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="pb-3">Salon Info</th>
                  <th className="pb-3">Owner Details</th>
                  <th className="pb-3 text-center">Rating</th>
                  <th className="pb-3 text-center">Total Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {topSalons.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-400 font-semibold mt-0.5">{s.city}, {s.state}</div>
                    </td>
                    <td className="py-4 font-semibold text-gray-700">
                      {s.owner?.name || "Unassigned"}
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1 font-bold text-amber-500">
                        <span>⭐</span>
                        <span>{s.rating || "0"}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-semibold text-gray-800">
                      {s.totalReviews || 0} reviews
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
