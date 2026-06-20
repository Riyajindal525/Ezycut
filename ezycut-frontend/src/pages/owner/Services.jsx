import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { getAllSalons } from "../../api/salon.api";
import {
  getServicesBySalon,
  createService,
  updateService,
  deleteService,
} from "../../api/service.api";

const OwnerServices = () => {
  const user = useAuthStore((state) => state.user);
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [salonLoading, setSalonLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "General",
  });

  useEffect(() => {
    const fetchSalonAndServices = async () => {
      try {
        const salonsResponse = await getAllSalons();
        const ownerSalon = salonsResponse.salons.find(
          (s) => s.owner?._id === user?.id || s.owner === user?.id
        );

        if (ownerSalon) {
          setSalon(ownerSalon);
          const servicesResponse = await getServicesBySalon(ownerSalon._id);
          setServices(servicesResponse.services);
        } else {
          setError("register_needed");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching salon catalog details.");
      } finally {
        setSalonLoading(false);
      }
    };

    fetchSalonAndServices();
  }, [user]);

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
        alert("Service updated successfully");
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
        alert("Service added successfully");
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save service details.");
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const res = await updateService(service._id, {
        isActive: !service.isActive,
      });
      setServices(services.map((s) => (s._id === service._id ? res.service : s)));
    } catch (err) {
      console.error(err);
      alert("Failed to toggle service status");
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Are you sure you want to remove this service from your catalog?")) return;

    try {
      await deleteService(serviceId);
      setServices(services.filter((s) => s._id !== serviceId));
      alert("Service deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete service");
    }
  };

  if (salonLoading) {
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
      {/* Upper header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{salon?.name} Catalog</h3>
          <p className="text-sm text-gray-400 font-semibold mt-1">Manage services, durations, and pricing</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-xl bg-black text-white hover:opacity-90 font-semibold shadow-sm transition-all"
        >
          + Add New Service
        </button>
      </div>

      {/* Services Table Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <h4 className="text-xl font-bold text-gray-600">No Services Registered</h4>
            <p className="text-gray-400 mt-1 text-sm font-semibold">Click "+ Add New Service" above to start building your catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {services.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-400 max-w-sm truncate mt-0.5">{s.description || "No description provided."}</div>
                    </td>
                    <td className="py-4 font-semibold">{s.category}</td>
                    <td className="py-4 font-semibold">{s.duration} mins</td>
                    <td className="py-4 font-bold text-gray-800">₹{s.price}</td>
                    <td className="py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                          s.isActive
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border text-gray-600 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{editingService ? "Edit Service" : "Add Service"}</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Specify catalog product details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Haircut & Wash"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of what is included..."
                  rows="3"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 350"
                    min="1"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Duration (Mins)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    min="1"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Hair, Shave, Facial"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-50 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerServices;
