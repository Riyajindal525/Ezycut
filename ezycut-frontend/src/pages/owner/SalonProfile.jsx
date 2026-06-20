import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { getAllSalons, updateSalon } from "../../api/salon.api";
import toast from "../../utils/toast";

const SalonProfile = () => {
  const user = useAuthStore((state) => state.user);

  // States
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");

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

  const fetchSalon = async () => {
    try {
      const salonsResponse = await getAllSalons();
      const ownerSalon = salonsResponse.salons.find(
        (s) => s.owner?._id === user?.id || s.owner === user?.id
      );

      if (ownerSalon) {
        setSalon(ownerSalon);
        setFormData({
          name: ownerSalon.name || "",
          description: ownerSalon.description || "",
          address: ownerSalon.address || "",
          city: ownerSalon.city || "",
          state: ownerSalon.state || "",
          pincode: ownerSalon.pincode || "",
          phone: ownerSalon.phone || "",
          latitude: ownerSalon.location?.coordinates?.[1]?.toString() || "",
          longitude: ownerSalon.location?.coordinates?.[0]?.toString() || "",
          openingTime: ownerSalon.openingTime || "09:00 AM",
          closingTime: ownerSalon.closingTime || "09:00 PM",
        });
      } else {
        setError("register_needed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load salon details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSalon();
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
          toast.success("Location coordinates updated!");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!salon) return;
    setSaveLoading(true);

    try {
      await updateSalon(salon._id, {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
      toast.success("Salon profile updated successfully!");
      fetchSalon();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update salon profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error === "register_needed") {
    return (
      <div className="max-w-xl bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Salon Setup Required</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          You have not registered a salon profile yet. Please complete your salon setup first.
        </p>
        <Link
          to="/owner/dashboard"
          className="inline-block px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Go to Dashboard Setup
        </Link>
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Salon Profile Settings</h3>
          <p className="text-sm text-gray-400 font-semibold mt-1">Configure your salon details, opening hours, and location</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            salon?.isApproved
              ? "bg-green-50 text-green-600 border border-green-100"
              : "bg-yellow-50 text-yellow-600 border border-yellow-100"
          }`}
        >
          {salon?.isApproved ? "Approved & Live" : "Pending Approval"}
        </span>
      </div>

      <div className="max-w-3xl bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Salon Name"
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
                placeholder="Phone Number"
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
              placeholder="Tell customers about your salon services..."
              rows="3"
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
              placeholder="Street Address"
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
                Capture Current Coordinates 📍
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
                  placeholder="Latitude"
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
                  placeholder="Longitude"
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
                placeholder="Opening Time (e.g. 09:00 AM)"
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
                placeholder="Closing Time (e.g. 09:00 PM)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="w-full py-3.5 bg-black text-white font-semibold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {saveLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving Profile Settings...
              </>
            ) : (
              "Save Profile Settings"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalonProfile;
