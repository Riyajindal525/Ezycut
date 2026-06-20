import { useEffect, useState } from "react";
import { getAdminRecentUsers } from "../../api/dashboard.api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await getAdminRecentUsers();
      setUsers(data.users);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch registered user accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800">User Accounts Directory</h3>
        <p className="text-sm text-gray-400 font-semibold mt-1">Audit platform-wide registered user profiles and role configurations</p>
      </div>

      {/* Users List Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800 font-semibold">Registered User Accounts</h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 font-bold tracking-wider">
            Showing Recent Profiles
          </span>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <h4 className="text-xl font-bold text-gray-600">No Users Registered</h4>
            <p className="text-gray-400 mt-1 text-sm font-semibold">User details will populating upon customer registration.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="pb-3">User ID</th>
                  <th className="pb-3">Full Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Account Role</th>
                  <th className="pb-3 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-mono text-xs text-gray-400">{u._id}</td>
                    <td className="py-4 font-bold text-gray-800">{u.name}</td>
                    <td className="py-4 font-semibold">{u.email}</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wider ${
                          u.role === "admin"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : u.role === "salon_owner"
                            ? "bg-purple-50 text-purple-600 border border-purple-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-right font-semibold">
                      {new Date(u.createdAt).toLocaleString()}
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

export default AdminUsers;
