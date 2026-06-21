import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import { getAllSalons, updateSalon, deleteSalon } from "../../api/salon.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Building, MapPin, Phone, Trash2, Clock, ShieldAlert, X } from "lucide-react";

const SalonProfile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons, fetchSalons, setActiveSalonId } = useSalonStore();

  // States
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typedSalonName, setTypedSalonName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const fetchActiveSalonProfile = async () => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        setFormData({
          name: activeSalon.name || "",
          description: activeSalon.description || "",
          address: activeSalon.address || "",
          city: activeSalon.city || "",
          state: activeSalon.state || "",
          pincode: activeSalon.pincode || "",
          phone: activeSalon.phone || "",
          latitude: activeSalon.location?.coordinates?.[1]?.toString() || "",
          longitude: activeSalon.location?.coordinates?.[0]?.toString() || "",
          openingTime: activeSalon.openingTime || "09:00 AM",
          closingTime: activeSalon.closingTime || "09:00 PM",
          imageUrl: activeSalon.images?.[0] || "",
        });
      } else {
        setError("register_needed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load salon profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActiveSalonProfile();
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
          toast.success("Location coordinates updated! 📍");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!salon) return;
    setSaveLoading(true);

    try {
      await updateSalon(salon._id, {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : []
      });
      toast.success("Salon profile details updated successfully! 🎉");
      await fetchSalons(true); // Refetch global store cache
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update salon profile settings.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteSalon = async () => {
    if (typedSalonName !== salon.name) {
      toast.error("Salon name does not match.");
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteSalon(salon._id);
      toast.success("Salon profile deleted successfully.");
      setShowDeleteModal(false);
      
      // Refresh global store cache
      const updatedSalons = await fetchSalons(true);
      const remainingOwned = updatedSalons.filter(
        (s) => s.owner?._id === user?.id || s.owner === user?.id
      );

      if (remainingOwned.length > 0) {
        setActiveSalonId(remainingOwned[0]._id);
        navigate("/owner/dashboard");
      } else {
        setActiveSalonId(null);
        navigate("/owner/dashboard?register=true");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete salon profile.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Retrieving salon registry settings..." />;
  }

  if (salons.filter(s => s.owner?._id === user?.id || s.owner === user?.id).length === 0 || error === "register_needed") {
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
          <h3 className="text-2xl font-black text-white">Salon Profile Settings</h3>
          <p className="text-sm text-zinc-400 font-semibold mt-1">Configure your salon details, opening hours, and location</p>
        </div>
        <span
          className={`self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            salon?.isApproved
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          {salon?.isApproved ? "Approved & Live" : "Pending Review"}
        </span>
      </div>

      <div className="max-w-3xl bg-[#121214] p-10 md:p-12 rounded-3xl border border-white/[0.04] shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Salon Name"
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
                placeholder="Phone Number"
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
              placeholder="Tell customers about your salon services..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Salon Showcase Image URL</label>
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
              placeholder="Street Address"
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
                Capture Current Coordinates 📍
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
                placeholder="Latitude"
              />
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                placeholder="Longitude"
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
                placeholder="Opening Time (e.g. 09:00 AM)"
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
                placeholder="Closing Time (e.g. 09:00 PM)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="btn btn-primary w-full py-4 mt-4 flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm"
          >
            {saveLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-950"></div>
                Saving Profile Settings...
              </>
            ) : (
              "Save Profile Settings"
            )}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="max-w-3xl bg-red-955/10 border border-red-900/20 p-8 rounded-3xl mt-8 space-y-4 shadow-sm">
        <div>
          <h4 className="text-lg font-bold text-red-500 flex items-center gap-1.5">
            <ShieldAlert size={20} /> Danger Zone
          </h4>
          <p className="text-sm text-zinc-455 font-semibold mt-1">Once you delete your salon profile, there is no going back. All appointments and lists will be permanently lost.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTypedSalonName("");
            setShowDeleteModal(true);
          }}
          className="px-6 py-3 bg-red-600/10 border border-red-500/25 text-red-400 font-bold rounded-xl hover:bg-red-650/20 hover:text-red-300 transition-colors text-sm"
        >
          Delete Salon Profile
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-start pb-2 border-b border-zinc-850">
              <div className="flex items-center gap-3">
                <div style={{
                  width: "2.5rem", height: "2.5rem", borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Trash2 size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-500">Delete Salon Profile</h3>
                  <p className="text-xs text-zinc-400 font-semibold mt-0.5">This action is permanent and cannot be reversed.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-sm text-zinc-350 leading-relaxed">
              All bookings, queue lines, and services for <strong>{salon?.name}</strong> will be permanently deleted.
            </p>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Type salon name <strong>{salon?.name}</strong> to confirm:</label>
              <input
                type="text"
                value={typedSalonName}
                onChange={(e) => setTypedSalonName(e.target.value)}
                placeholder={salon?.name}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-855">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTypedSalonName("");
                }}
                className="px-5 py-2.5 border border-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-850 text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSalon}
                disabled={typedSalonName !== salon?.name || deleteLoading}
                className="px-6 py-2.5 bg-red-650 hover:bg-red-750 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonProfile;
