import { useEffect, useState } from "react";
import {
  getAllSalons,
  updateSalon,
  assignOwner,
  deleteSalon,
} from "../../api/salon.api";
import toast from "../../utils/toast";

const AdminSalons = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reassign Modal States
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState(null);
  const [targetOwnerId, setTargetOwnerId] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);

  // Delete Salon States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [salonToDelete, setSalonToDelete] = useState(null);
  const [confirmTypedText, setConfirmTypedText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenDeleteModal = (salon) => {
    setSalonToDelete(salon);
    setConfirmTypedText("");
    setDeleteModalOpen(true);
  };

  const submitDeleteSalon = async () => {
    if (confirmTypedText !== `delete ${salonToDelete.name}`) {
      toast.error("Confirmation text does not match.");
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteSalon(salonToDelete._id);
      toast.success("Salon deleted successfully! 🗑️");
      setDeleteModalOpen(false);
      setSalonToDelete(null);
      setConfirmTypedText("");
      fetchSalonsList(); // Refresh
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete salon.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchSalonsList = async () => {
    try {
      const data = await getAllSalons();
      setSalons(data.salons);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch salons catalog directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonsList();
  }, []);

  const handleToggleApproval = async (salon) => {
    try {
      const res = await updateSalon(salon._id, {
        isApproved: !salon.isApproved,
      });
      alert(`Salon status set to ${res.salon.isApproved ? "Approved" : "Pending"}`);
      fetchSalonsList(); // Refresh
    } catch (err) {
      console.error(err);
      alert("Failed to update salon approval state.");
    }
  };

  const handleReassignOwner = (salonId) => {
    setSelectedSalonId(salonId);
    setTargetOwnerId("");
    setReassignModalOpen(true);
  };

  const submitReassignOwner = async (e) => {
    e.preventDefault();
    if (!selectedSalonId || !targetOwnerId.trim()) return;
    setReassignLoading(true);
    try {
      await assignOwner(selectedSalonId, targetOwnerId.trim());
      toast.success("Owner reassigned successfully! 🎉");
      setReassignModalOpen(false);
      setSelectedSalonId(null);
      setTargetOwnerId("");
      fetchSalonsList(); // Refresh
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign owner.");
    } finally {
      setReassignLoading(false);
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
        <h3 className="text-2xl font-bold text-gray-800">Salons Controller</h3>
        <p className="text-sm text-gray-400 font-semibold mt-1">Audit platform salon profiles, approvals, and ownership mappings</p>
      </div>

      {/* Salons List Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {salons.length === 0 ? (
          <div className="text-center py-12">
            <h4 className="text-xl font-bold text-gray-600">No Salons Found</h4>
            <p className="text-gray-400 mt-1 text-sm font-semibold">Registered salons will show up here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="pb-3">Salon Info</th>
                  <th className="pb-3">Address</th>
                  <th className="pb-3">Owner Details</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {salons.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-400 font-semibold mt-0.5">ID: {s._id}</div>
                    </td>
                    <td className="py-4">
                      <div>{s.address}</div>
                      <div className="text-xs text-gray-400 font-semibold mt-0.5">{s.city}, {s.state} - {s.pincode}</div>
                    </td>
                    <td className="py-4">
                      {s.owner ? (
                        <div>
                          <div className="font-bold text-gray-700">{s.owner.name}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {s.owner._id || s.owner}</div>
                        </div>
                      ) : (
                        <span className="text-red-500 font-semibold italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 font-semibold">{s.phone}</td>
                    <td className="py-4 text-center">
                      <button
                        onClick={() => handleToggleApproval(s)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                          s.isApproved
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                        }`}
                      >
                        {s.isApproved ? "Approved" : "Pending"}
                      </button>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => handleReassignOwner(s._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border text-gray-400 hover:bg-gray-800 transition-colors"
                      >
                        Reassign Owner
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 transition-colors"
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

      {/* Reassign Owner Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Reassign Salon Owner</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Change the owner assigned to this salon profile</p>
            </div>

            <form onSubmit={submitReassignOwner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Owner User ID</label>
                <input
                  type="text"
                  value={targetOwnerId}
                  onChange={(e) => setTargetOwnerId(e.target.value)}
                  placeholder="e.g. 64b2fd9c8d19bc0012f4581a"
                  required
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setReassignModalOpen(false);
                    setSelectedSalonId(null);
                    setTargetOwnerId("");
                  }}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-50 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassignLoading}
                  className="px-5 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:opacity-95 transition-opacity flex items-center gap-1.5"
                >
                  {reassignLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Assignment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && salonToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-red-500">Delete Salon</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">This action is permanent and cannot be reversed.</p>
            </div>
            
            <p className="text-sm text-gray-300">
              Are you sure you want to delete the salon <strong>{salonToDelete.name}</strong>?
            </p>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Type <strong>delete {salonToDelete.name}</strong> to confirm:</label>
              <input
                type="text"
                value={confirmTypedText}
                onChange={(e) => setConfirmTypedText(e.target.value)}
                placeholder={`delete ${salonToDelete.name}`}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSalonToDelete(null);
                  setConfirmTypedText("");
                }}
                className="px-4 py-2 border border-zinc-850 rounded-xl text-sm font-semibold hover:bg-zinc-800 text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDeleteSalon}
                disabled={confirmTypedText !== `delete ${salonToDelete.name}` || deleteLoading}
                className="px-5 py-2 bg-red-650 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default AdminSalons;
