import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import { getAllSalons, createSalon, updateSalon } from "../../api/salon.api";
import { getSalonBookings } from "../../api/booking.api";
import { getSalonQueue } from "../../api/queue.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import {
  TrendingUp,
  Calendar,
  Clock,
  Star,
  DollarSign,
  MapPin,
  Phone,
  Plus,
  ArrowRight,
  Info,
  Building,
  User,
  ListOrdered,
  ChevronRight
} from "lucide-react";

const OwnerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, setActiveSalonId, salons, fetchSalons } = useSalonStore();
  const location = useLocation();
  const navigate = useNavigate();

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
    imageUrl: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  const ownedSalons = salons.filter(
    (s) => s.owner?._id === user?.id || s.owner === user?.id
  );

  // Parse query params to toggle register form
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("register") === "true") {
      setShowRegisterForm(true);
    } else {
      setShowRegisterForm(false);
    }
  }, [location.search]);

  // Compute metrics from bookings and queue
  const loadActiveSalonData = async (salonObj) => {
    setLoading(true);
    try {
      const [bookingsData, queueData] = await Promise.all([
        getSalonBookings(salonObj._id),
        getSalonQueue(salonObj._id),
      ]);

      const allBookings = bookingsData.bookings || [];
      const queueList = queueData.queue || [];

      // Calculations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCount = allBookings.filter((b) => {
        const bDate = new Date(b.bookingDate);
        return bDate >= today && bDate < tomorrow && b.status !== "cancelled_by_customer" && b.status !== "cancelled_by_owner";
      }).length;

      const completed = allBookings.filter((b) => b.status === "completed");
      const revenueSum = completed.reduce((sum, b) => sum + b.totalAmount, 0);

      // Recent Bookings (top 5)
      const recent = allBookings.slice(0, 5);

      // Top Performing Services
      const serviceStats = {};
      completed.forEach((b) => {
        const sName = b.service?.name || "General";
        if (!serviceStats[sName]) {
          serviceStats[sName] = { service: sName, totalBookings: 0, revenue: 0 };
        }
        serviceStats[sName].totalBookings += 1;
        serviceStats[sName].revenue += b.totalAmount;
      });
      const topS = Object.values(serviceStats)
        .sort((a, b) => b.totalBookings - a.totalBookings)
        .slice(0, 5);

      // Monthly Revenue Comparisons
      const monthlyStats = {};
      completed.forEach((b) => {
        const date = new Date(b.bookingDate);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        if (!monthlyStats[key]) {
          monthlyStats[key] = { _id: { month, year }, revenue: 0, bookings: 0 };
        }
        monthlyStats[key].revenue += b.totalAmount;
        monthlyStats[key].bookings += 1;
      });
      const monthlyRev = Object.values(monthlyStats).sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        return a._id.month - b._id.month;
      });

      setOverview({
        totalRevenue: revenueSum,
        todayBookings: todayCount,
        completedBookings: completed.length,
        activeQueue: queueList.length,
        averageRating: salonObj.rating || 0,
        totalReviews: salonObj.totalReviews || 0,
      });
      setRecentBookings(recent);
      setTopServices(topS);
      setMonthlyRevenue(monthlyRev);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load salon analytics.");
    } finally {
      setLoading(false);
    }
  };

  // Sync state with active salon selection
  useEffect(() => {
    const initSalon = async () => {
      setSalonLoading(true);
      await fetchSalons();

      if (ownedSalons.length === 0) {
        setShowRegisterForm(true);
        setSalon(null);
        setSalonLoading(false);
        return;
      }

      // Check active selection
      let currentSalon = ownedSalons.find((s) => s._id === activeSalonId);
      if (!currentSalon) {
        currentSalon = ownedSalons[0];
        setActiveSalonId(currentSalon._id);
      }

      setSalon(currentSalon);

      if (currentSalon.isApproved) {
        await loadActiveSalonData(currentSalon);
      } else {
        // Pending state
        setOverview(null);
        setRecentBookings([]);
        setTopServices([]);
        setMonthlyRevenue([]);
      }
      setSalonLoading(false);
    };

    if (user) {
      initSalon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

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
          toast.success("Location coordinates captured! 📍");
        },
        (err) => {
          console.error(err);
          toast.error("Failed to detect location. Please enter coordinates manually.");
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
      const res = await createSalon({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });

      if (formData.imageUrl.trim() && res.salon?._id) {
        await updateSalon(res.salon._id, {
          images: [formData.imageUrl.trim()]
        });
      }

      toast.success("Salon profile submitted successfully! Please wait for admin approval. ⏳");
      
      // Refresh list and select the new salon
      const updatedSalons = await fetchSalons(true);
      const newSalon = updatedSalons.find((s) => s.name === formData.name);
      if (newSalon) {
        setActiveSalonId(newSalon._id);
      }
      
      setFormData({
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
        imageUrl: "",
      });

      navigate("/owner/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to register salon. Please review fields.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("default", { month: "short" });
  };

  if (salonLoading) {
    return <Loader message="Verifying salon profile association..." />;
  }

  // State 1: Register Salon Form
  if (showRegisterForm) {
    return (
      <div className="max-w-4xl mx-auto bg-[#121214] p-10 md:p-12 rounded-3xl border border-zinc-850 shadow-2xl space-y-8 animate-fade-in">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-850">
          <div>
            <span className="inline-flex bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-[#fbbf24] uppercase tracking-wider mb-2.5">
              Onboarding
            </span>
            <h3 className="text-3xl font-black text-white">Register Salon Profile</h3>
            <p className="text-sm text-zinc-400 font-medium mt-1">Configure details to enlist your shop on EzyCut</p>
          </div>
          {ownedSalons.length > 0 && (
            <button
              onClick={() => navigate("/owner/dashboard")}
              className="px-5 py-2.5 text-sm font-semibold border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Salon Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="e.g. Sharp & Sleek Salon"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="e.g. +91 9876543210"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
              placeholder="Provide a compelling catalog description for customers..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Salon Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
              placeholder="e.g. https://images.unsplash.com/photo-... (optional)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
              placeholder="e.g. Shop 42, 1st Floor, Royal Complex"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="Pincode"
              />
            </div>
          </div>

          <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-850 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Geolocation Coordinates</span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="px-4 py-2 text-xs font-bold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                Use Current Location 📍
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="Latitude (e.g. 28.61)"
              />
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="Longitude (e.g. 77.20)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Opening Time</label>
              <input
                type="text"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="e.g. 09:00 AM"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Closing Time</label>
              <input
                type="text"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="e.g. 09:00 PM"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerLoading}
            className="btn btn-primary w-full py-4 mt-4 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider"
          >
            {registerLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-950"></div>
                Registering Shop...
              </>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>
      </div>
    );
  }

  // State 2: Active Salon Pending Approval
  if (salon && !salon.isApproved) {
    return (
      <div className="max-w-2xl mx-auto bg-[#121214] p-10 rounded-3xl border border-zinc-850 shadow-xl space-y-6 text-center animate-fade-in">
        <div style={{
          width: "4.5rem", height: "4.5rem", borderRadius: "50%",
          background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
        }}>
          <Clock size={36} style={{ color: "#fbbf24" }} />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white">Registration Under Review</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            The profile details for <strong>{salon.name}</strong> have been submitted and are pending review by our administration. We will activate your dashboard once verified.
          </p>
        </div>

        <div className="border-t border-zinc-850 pt-8 mt-8 flex flex-col gap-4 items-center">
          <div className="flex items-center gap-2 text-xs text-zinc-550 font-semibold">
            <Info size={14} /> Need to list another store?
          </div>
          <button
            onClick={() => navigate("/owner/dashboard?register=true")}
            className="btn btn-outline px-6 py-2.5 font-bold rounded-xl text-sm"
          >
            + Register Another Salon
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader message="Recalculating salon insights..." />;
  }

  const maxRevenue = monthlyRevenue.length > 0
    ? Math.max(...monthlyRevenue.map((m) => m.revenue))
    : 1;

  return (
    <div className="space-y-10 md:space-y-12 animate-fade-in text-white">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Card 1 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total Revenue</span>
            <div style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <DollarSign size={16} style={{ color: "#10b981" }} />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-4xl font-extrabold text-white tracking-tight">₹{overview?.totalRevenue || 0}</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
              <span>▲</span> Lifetime completed sales
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Today's Bookings</span>
            <div style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "10px",
              background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Calendar size={16} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-4xl font-extrabold text-white tracking-tight">{overview?.todayBookings || 0}</h3>
            <p className="text-xs text-blue-400 font-semibold mt-2">Scheduled for today</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Active Queue</span>
            <div style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "10px",
              background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Clock size={16} style={{ color: "#fbbf24" }} />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-4xl font-extrabold text-white tracking-tight">{overview?.activeQueue || 0}</h3>
            <p className="text-xs text-amber-400 font-semibold mt-2">Clients checked-in/waiting</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Salon Rating</span>
            <div style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "10px",
              background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Star size={16} style={{ color: "#a855f7" }} />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-4xl font-extrabold text-white tracking-tight">
              {overview?.averageRating || 0} <span className="text-lg font-normal text-zinc-550">/ 5</span>
            </h3>
            <p className="text-xs text-purple-400 font-semibold mt-2">Across {overview?.totalReviews || 0} reviews</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        
        {/* Recent Appointments */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] shadow-md lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={20} className="text-[#fbbf24]" /> Recent Appointments
            </h3>
            <Link to="/owner/bookings" className="text-xs font-bold text-[#fbbf24] hover:text-[#eab308] transition-colors flex items-center gap-0.5">
              Manage Bookings <ChevronRight size={14} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-sm text-zinc-500 py-10 text-center font-medium">No bookings logged for this salon yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-850">
                    <th className="pb-3.5">Customer</th>
                    <th className="pb-3.5">Service</th>
                    <th className="pb-3.5">Date</th>
                    <th className="pb-3.5">Time</th>
                    <th className="pb-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-zinc-900/35 transition-colors">
                      <td className="py-4.5 font-bold text-white">{b.customer?.name}</td>
                      <td className="py-4.5 font-semibold text-zinc-300">{b.service?.name}</td>
                      <td className="py-4.5 text-zinc-450">{new Date(b.bookingDate).toLocaleDateString()}</td>
                      <td className="py-4.5 font-mono font-bold text-zinc-400">{b.startTime}</td>
                      <td className="py-4.5 text-right">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            b.status === "completed"
                              ? "bg-blue-500/10 text-blue-450 border border-blue-500/20"
                              : b.status === "confirmed"
                              ? "bg-emerald-500/10 text-emerald-440 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-450 border border-red-500/20"
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
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] shadow-md space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-[#fbbf24]" /> Top Performing Services
            </h3>
            <Link to="/owner/services" className="text-xs font-bold text-[#fbbf24] hover:text-[#eab308] transition-colors flex items-center gap-0.5">
              Catalog <ChevronRight size={14} />
            </Link>
          </div>

          {topServices.length === 0 ? (
            <p className="text-sm text-zinc-500 py-10 text-center font-medium">No sales statistics available.</p>
          ) : (
            <div className="space-y-4">
              {topServices.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-zinc-950/40 border border-zinc-850 hover:border-zinc-800 transition-colors shadow-sm">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{item.service}</h4>
                    <p className="text-[11px] text-zinc-450 font-semibold mt-0.5">{item.totalBookings} orders filled</p>
                  </div>
                  <span className="font-mono font-bold text-[#fbbf24] text-base">₹{item.revenue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Revenue Comparisons */}
      <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] shadow-md">
        <h3 className="text-lg font-bold text-white mb-6">Monthly Revenue Comparisons ({new Date().getFullYear()})</h3>
        {monthlyRevenue.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 font-medium text-sm">
            No completed sales aggregates recorded for this calendar year.
          </div>
        ) : (
          <div className="space-y-6">
            {monthlyRevenue.map((m, idx) => {
              const pct = (m.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-zinc-300 font-bold">{getMonthName(m._id.month)}</span>
                    <span className="text-white font-extrabold text-base">
                      ₹{m.revenue} <span className="text-zinc-500 text-xs font-semibold">({m.bookings} bookings)</span>
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-850">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #eab308 0%, #fbbf24 100%)",
                        boxShadow: "0 0 8px rgba(251, 191, 36, 0.4)"
                      }}
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
