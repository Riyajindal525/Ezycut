import { useEffect, useState } from "react";
import useAuthStore from "../../store/auth.store";
import { getAllSalons, createSalon } from "../../api/salon.api";
import {
  getOwnerOverview,
  getOwnerRecentBookings,
  getOwnerTopServices,
  getOwnerMonthlyRevenue,
} from "../../api/dashboard.api";
import toast from "../../utils/toast";

const OwnerDashboard = () => {
  const user = useAuthStore((state) => state.user);

  // States
  const [salon, setSalon] = useState(null);
  const [salonLoading, setSalonLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Onboarding Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    latitude: "",
    longitude: "",
    openingTime: "09:00 AM",
    closingTime: "09:00 PM",
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewData, bookingsData, servicesData, monthlyData] = await Promise.all([
        getOwnerOverview(),
        getOwnerRecentBookings(),
        getOwnerTopServices(),
        getOwnerMonthlyRevenue(),
      ]);

      setOverview(overviewData.overview);
      setRecentBookings(bookingsData.bookings);
      setTopServices(servicesData.services);
      setMonthlyRevenue(monthlyData.revenue || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard metrics. Ensure your salon is approved.");
    } finally {
      setLoading(false);
    }
  };

  const checkSalonOwnership = async () => {
    setSalonLoading(true);
    setError("");
    try {
      const salonsResponse = await getAllSalons();
      const ownerSalon = salonsResponse.salons.find(
        (s) => s.owner?._id === user?.id || s.owner === user?.id
      );

      if (ownerSalon) {
        setSalon(ownerSalon);
        if (ownerSalon.isApproved) {
          await fetchDashboardData();
        } else {
          setError("Your salon registration is pending administrator approval.");
        }
      } else {
        setShowRegisterForm(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to verify salon association.");
    } finally {
      setSalonLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSalonOwnership();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          toast.success("Location coordinates captured!");
        },
        (err) => {
          console.error(err);
          toast.error("Failed to detect location. Please enter manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      await createSalon({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
      toast.success("Salon registered successfully! Please wait for approval.");
      setShowRegisterForm(false);
      await checkSalonOwnership();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to register salon. Double check all fields.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  // Rendering conditional states
  if (salonLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (showRegisterForm) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-800">Register Your Salon</h3>
          <p className="text-sm text-gray-400 font-semibold mt-1">Get started by setting up your salon profile</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Salon Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                placeholder="e.g. Sharp & Sleek Salon"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                placeholder="e.g. +91 9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
              placeholder="Tell customers about your salon..."
              rows="2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
              placeholder="e.g. 1st Floor, Metro Plaza"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                placeholder="Pincode"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Geolocation Coordinates</span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="px-3 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Use Current Location 📍
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800 bg-white"
                  placeholder="Latitude (e.g. 28.6139)"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800 bg-white"
                  placeholder="Longitude (e.g. 77.2090)"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Opening Time</label>
              <input
                type="text"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                placeholder="e.g. 09:00 AM"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Closing Time</label>
              <input
                type="text"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                placeholder="e.g. 09:00 PM"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerLoading}
            className="w-full py-3.5 bg-black text-white font-semibold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {registerLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Registering Salon...
              </>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const maxRevenue = monthlyRevenue.length > 0
    ? Math.max(...monthlyRevenue.map((m) => m.revenue))
    : 1;

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
            <p className="text-xs text-green-500 font-semibold mt-1">▲ Lifetime completed sales</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Today's Bookings</span>
            <span className="text-2xl">📅</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800">{overview?.todayBookings || 0}</h3>
            <p className="text-xs text-blue-500 font-semibold mt-1">Scheduled for today</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Queue</span>
            <span className="text-2xl">⌛</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800">{overview?.activeQueue || 0}</h3>
            <p className="text-xs text-yellow-500 font-semibold mt-1">Clients waiting in-shop</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Salon Rating</span>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800">
              {overview?.averageRating || 0} <span className="text-lg font-normal text-gray-400">/ 5</span>
            </h3>
            <p className="text-xs text-purple-500 font-semibold mt-1">Across {overview?.totalReviews || 0} reviews</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Recent Appointments</h3>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No recent bookings scheduled.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-600">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-semibold text-gray-800">{b.customer?.name}</td>
                      <td className="py-3">{b.service?.name}</td>
                      <td className="py-3">{new Date(b.bookingDate).toLocaleDateString()}</td>
                      <td className="py-3 font-mono">{b.startTime}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            b.status === "completed"
                              ? "bg-blue-50 text-blue-600"
                              : b.status === "confirmed"
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Services */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Top Performing Services</h3>
          {topServices.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No service statistics available.</p>
          ) : (
            <div className="space-y-4">
              {topServices.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.service || "General"}</h4>
                    <p className="text-xs text-gray-400 font-semibold">{item.totalBookings} appointments</p>
                  </div>
                  <span className="font-bold text-slate-800">₹{item.revenue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
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

export default OwnerDashboard;
