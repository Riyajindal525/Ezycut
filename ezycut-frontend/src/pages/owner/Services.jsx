import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getServicesBySalon,
  createService,
  updateService,
  deleteService,
} from "../../api/service.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Wrench, Trash2, Edit2, ToggleLeft, ToggleRight, Plus, HelpCircle, X, Check } from "lucide-react";

const OwnerServices = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [salonLoading, setSalonLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Deletion Confirm Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "General",
  });

  const fetchSalonAndServices = async () => {
    if (!activeSalonId) {
      setSalonLoading(false);
      return;
    }
    setSalonLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const servicesResponse = await getServicesBySalon(activeSalonId);
        setServices(servicesResponse.services || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salon catalog details.");
    } finally {
      setSalonLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "General",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      category: service.category || "General",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!salon) return;
    setSaveLoading(true);

    try {
      if (editingService) {
        // Edit service
        const res = await updateService(editingService._id, {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          duration: Number(formData.duration),
          category: formData.category,
        });
        setServices(services.map((s) => (s._id === editingService._id ? res.service : s)));
        toast.success("Service catalog listing updated!");
      } else {
        // Add service
        const res = await createService({
          salonId: salon._id,
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          duration: Number(formData.duration),
          category: formData.category,
        });
        setServices([res.service, ...services]);
        toast.success("New service appended to catalog! 🎉");
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save service catalog entry.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const res = await updateService(service._id, {
        isActive: !service.isActive,
      });
      setServices(services.map((s) => (s._id === service._id ? res.service : s)));
      toast.success(`Service is now ${res.service.isActive ? "active" : "inactive"}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const triggerDeleteConfirm = (serviceId) => {
    setTargetDeleteId(serviceId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteId) return;
    setDeleteLoading(true);
    try {
      await deleteService(targetDeleteId);
      setServices(services.filter((s) => s._id !== targetDeleteId));
      toast.success("Service removed from catalog successfully.");
      setDeleteConfirmOpen(false);
      setTargetDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete service catalog item.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (salonLoading) {
    return <Loader message="Loading service categories..." />;
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
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-[#121214] p-8 rounded-3xl border border-white/[0.04] shadow-md gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">{salon?.name} Catalog</h3>
          <p className="text-sm text-zinc-400 font-semibold mt-1">Manage services, durations, and pricing</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary px-6 py-3.5 rounded-xl font-black shadow-sm transition-all flex items-center gap-1.5 self-start text-xs uppercase tracking-wider"
        >
          <Plus size={16} strokeWidth={2.5} /> Add New Service
        </button>
      </div>

      {/* Services Table Card */}
      <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] shadow-md">
        {services.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div style={{
              width: "4rem", height: "4rem", borderRadius: "50%",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
            }}>
              <Wrench size={24} className="text-zinc-500" />
            </div>
            <h4 className="text-xl font-bold text-zinc-400">No Catalog Services</h4>
            <p className="text-zinc-500 mt-1 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
              Click "+ Add New Service" above to start building your shop menu catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-855 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-4 pl-2">Name</th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4">Duration</th>
                  <th className="pb-4">Price</th>
                  <th className="pb-4 text-center">Status</th>
                  <th className="pb-4 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {services.map((s) => (
                  <tr key={s._id} className="hover:bg-zinc-900/35 transition-colors">
                    <td className="py-5 pl-2">
                      <div className="font-extrabold text-white text-base">{s.name}</div>
                      <div className="text-xs text-zinc-450 max-w-sm truncate mt-1">{s.description || "No description provided."}</div>
                    </td>
                    <td className="py-5 font-semibold text-zinc-300">
                      <span className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs font-bold text-zinc-300 tracking-wide uppercase">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-5 font-mono font-bold text-zinc-400">{s.duration} mins</td>
                    <td className="py-5 font-black text-[#fbbf24] text-base">₹{s.price}</td>
                    <td className="py-5 text-center">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-colors border ${
                          s.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15"
                            : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15"
                        }`}
                      >
                        {s.isActive ? (
                          <>
                            <Check size={10} strokeWidth={3} /> Active
                          </>
                        ) : (
                          <>
                            <X size={10} strokeWidth={3} /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-5 text-right pr-2">
                      <div className="inline-flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-2.5 rounded-xl text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => triggerDeleteConfirm(s._id)}
                          className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Styled React Form Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-start pb-2 border-b border-zinc-850">
              <div>
                <h3 className="text-xl font-bold text-white">{editingService ? "Edit Service" : "Add Service"}</h3>
                <p className="text-xs text-zinc-400 font-semibold mt-1">Specify catalog product details</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Haircut & Wash"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of what is included in the service..."
                  rows="3"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 350"
                    min="1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Duration (Mins)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    min="1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Haircut, Shaving, Massage"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 bg-[#fbbf24] hover:bg-[#eab308] text-[#09090b] rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5"
                >
                  {saveLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-zinc-950"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled React Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div style={{
                width: "2.5rem", height: "2.5rem", borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <HelpCircle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Remove Service</h3>
                <p className="text-xs text-zinc-400 font-semibold">Delete catalog listing</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Are you sure you want to remove this service from your catalog? This action will prevent new reservations for this service.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setTargetDeleteId(null);
                }}
                className="px-5 py-2.5 border border-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-800 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5"
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

export default OwnerServices;
