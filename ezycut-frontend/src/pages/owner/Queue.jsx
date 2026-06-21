import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getSalonQueue,
  startService,
  completeQueue,
  cancelQueue,
} from "../../api/queue.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Clock, HelpCircle, Play, Check, Trash2 } from "lucide-react";

const OwnerQueue = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Queue Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetQueueId, setTargetQueueId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchSalonAndQueue = async (showLoader = false) => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    if (showLoader) setLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const queueResponse = await getSalonQueue(activeSalonId);
        setQueueItems(queueResponse.queue || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load active queue list.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndQueue(true);

    // Dynamic Polling every 10 seconds
    const interval = setInterval(() => {
      fetchSalonAndQueue(false);
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const handleQueueAction = async (queueId, actionFn, successMessage) => {
    try {
      await actionFn(queueId);
      toast.success(successMessage);
      fetchSalonAndQueue(false); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process queue action.");
    }
  };

  const triggerCancelQueue = (queueId) => {
    setTargetQueueId(queueId);
    setCancelModalOpen(true);
  };

  const handleConfirmCancelQueue = async () => {
    if (!targetQueueId) return;
    setCancelLoading(true);
    try {
      await cancelQueue(targetQueueId);
      toast.success("Client entry removed from queue!");
      setCancelModalOpen(false);
      setTargetQueueId(null);
      fetchSalonAndQueue(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel queue entry.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Derived statistics
  const currentServing = queueItems.find((q) => q.status === "in_service");
  const waitingList = queueItems.filter((q) => q.status === "waiting");

  if (loading) {
    return <Loader message="Loading waitlist queue..." />;
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Clients Waiting</span>
          <div className="mt-6">
            <h3 className="text-3xl font-black text-white">{waitingList.length}</h3>
            <p className="text-xs text-zinc-500 font-semibold mt-2">In line to be served</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Currently Serving</span>
          <div className="mt-6">
            {currentServing ? (
              <div>
                <h3 className="text-xl font-black text-[#fbbf24] truncate">{currentServing.customer?.name}</h3>
                <p className="text-xs text-zinc-400 font-semibold mt-2">{currentServing.service?.name} (Token: #{currentServing.tokenNumber})</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-zinc-500 italic">No Active Client</h3>
                <p className="text-xs text-zinc-550 font-semibold mt-2">Start next client from list</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] flex flex-col justify-between hover:border-[#fbbf24]/20 hover:-translate-y-1 transition-all duration-300 shadow-md">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Next In Line</span>
          <div className="mt-6">
            {waitingList.length > 0 ? (
              <div>
                <h3 className="text-xl font-black text-white truncate">{waitingList[0].customer?.name}</h3>
                <p className="text-xs text-zinc-400 font-semibold mt-2">Token: #{waitingList[0].tokenNumber}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-zinc-500 italic">No one in line</h3>
                <p className="text-xs text-zinc-550 font-semibold mt-2">Queue is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Waitlist Table */}
      <div className="bg-[#121214] p-8 rounded-3xl border border-white/[0.04] shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-3 border-b border-zinc-850">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock size={22} className="text-[#fbbf24]" /> Queue Waitlist — {salon?.name}
          </h3>
          <span className="inline-flex items-center gap-1.5 self-start text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-850">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Auto-refreshing in background
          </span>
        </div>

        {queueItems.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div style={{
              width: "4rem", height: "4rem", borderRadius: "50%",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
            }}>
              <Clock size={24} className="text-zinc-500" />
            </div>
            <h4 className="text-xl font-bold text-zinc-400">Queue is Clear</h4>
            <p className="text-zinc-500 mt-1 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
              Customers will join the queue once checked-in from their bookings dashboard.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-4 pl-2">Token Code</th>
                  <th className="pb-4">Token #</th>
                  <th className="pb-4">Client</th>
                  <th className="pb-4">Phone</th>
                  <th className="pb-4">Service</th>
                  <th className="pb-4">Wait time</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {queueItems.map((q) => (
                  <tr key={q._id} className={`hover:bg-zinc-900/35 transition-colors ${q.status === "in_service" ? "bg-blue-500/5" : ""}`}>
                    <td className="py-5 pl-2 font-mono font-bold text-[#fbbf24] text-base">{q.tokenCode}</td>
                    <td className="py-5 font-bold text-white">#{q.tokenNumber}</td>
                    <td className="py-5 font-bold text-white">{q.customer?.name}</td>
                    <td className="py-5 font-semibold text-zinc-400">{q.customer?.phone || "N/A"}</td>
                    <td className="py-5 font-bold text-zinc-200">{q.service?.name}</td>
                    <td className="py-5 font-mono font-bold text-zinc-400">{q.estimatedWaitTime} mins</td>
                    <td className="py-5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          q.status === "in_service"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {q.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-5 text-right pr-2">
                      <div className="inline-flex gap-2 justify-end">
                        {q.status === "waiting" && (
                          <button
                            onClick={() => handleQueueAction(q._id, startService, "Client service started! 💈")}
                            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5"
                          >
                            <Play size={10} fill="white" /> Start Service
                          </button>
                        )}
                        {q.status === "in_service" && (
                          <button
                            onClick={() => handleQueueAction(q._id, completeQueue, "Client service completed! 🎉")}
                            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5"
                          >
                            <Check size={10} strokeWidth={3} /> Complete
                          </button>
                        )}
                        <button
                          onClick={() => triggerCancelQueue(q._id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Trash2 size={10} /> Remove
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

      {/* Styled React Queue Cancel Confirmation Modal */}
      {cancelModalOpen && (
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
                <h3 className="text-lg font-bold text-white">Cancel Entry</h3>
                <p className="text-xs text-zinc-400 font-semibold">Remove client from queue line</p>
              </div>
            </div>

            <p className="text-sm text-zinc-350 leading-relaxed">
              Are you sure you want to cancel and remove this client from the queue waitlist? This cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setTargetQueueId(null);
                }}
                className="px-5 py-2.5 border border-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-800 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelQueue}
                disabled={cancelLoading}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                {cancelLoading ? "Removing..." : "Remove Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerQueue;
