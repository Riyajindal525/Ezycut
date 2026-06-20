import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { getAllSalons } from "../../api/salon.api";
import {
  getSalonQueue,
  startService,
  completeQueue,
  cancelQueue,
} from "../../api/queue.api";

const OwnerQueue = () => {
  const user = useAuthStore((state) => state.user);
  const [salon, setSalon] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSalonAndQueue = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const salonsResponse = await getAllSalons();
      const ownerSalon = salonsResponse.salons.find(
        (s) => s.owner?._id === user?.id || s.owner === user?.id
      );

      if (ownerSalon) {
        setSalon(ownerSalon);
        const queueResponse = await getSalonQueue(ownerSalon._id);
        setQueueItems(queueResponse.queue);
      } else {
        setError("register_needed");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching salon queue list.");
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
  }, [user]);

  const handleQueueAction = async (queueId, actionFn, successMessage) => {
    try {
      await actionFn(queueId);
      alert(successMessage);
      fetchSalonAndQueue(false); // Refresh list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to process queue action.");
    }
  };

  // Derived statistics
  const currentServing = queueItems.find((q) => q.status === "in_service");
  const waitingList = queueItems.filter((q) => q.status === "waiting");

  if (loading) {
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Clients Waiting</span>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800">{waitingList.length}</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">In line to be served</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Currently Serving</span>
          <div className="mt-4">
            {currentServing ? (
              <div>
                <h3 className="text-xl font-extrabold text-blue-600 truncate">{currentServing.customer?.name}</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">{currentServing.service?.name} (Token: #{currentServing.tokenNumber})</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-400 italic">No Active Customer</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Start next client from list</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Next In Line</span>
          <div className="mt-4">
            {waitingList.length > 0 ? (
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 truncate">{waitingList[0].customer?.name}</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Token: #{waitingList[0].tokenNumber}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-400 italic">No one in line</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Queue is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Waitlist Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            Queue Waitlist — {salon?.name}
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg">
            🔄 Auto-refreshing in background
          </span>
        </div>

        {queueItems.length === 0 ? (
          <div className="text-center py-12">
            <h4 className="text-xl font-bold text-gray-600">Queue is Clear</h4>
            <p className="text-gray-400 mt-1 text-sm font-semibold">Customers will join the queue once checked-in from their bookings page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="pb-3">Token Code</th>
                  <th className="pb-3">Token #</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Wait time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {queueItems.map((q) => (
                  <tr key={q._id} className={`hover:bg-gray-50/50 transition-colors ${q.status === "in_service" ? "bg-blue-50/20" : ""}`}>
                    <td className="py-4 font-mono font-bold text-slate-800">{q.tokenCode}</td>
                    <td className="py-4 font-bold text-gray-800">#{q.tokenNumber}</td>
                    <td className="py-4 font-bold text-gray-800">{q.customer?.name}</td>
                    <td className="py-4 font-semibold">{q.customer?.phone}</td>
                    <td className="py-4 font-semibold">{q.service?.name}</td>
                    <td className="py-4 font-semibold">{q.estimatedWaitTime} mins</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          q.status === "in_service"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-yellow-50 text-yellow-600 border border-yellow-100"
                        }`}
                      >
                        {q.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-1.5">
                      {q.status === "waiting" && (
                        <button
                          onClick={() => handleQueueAction(q._id, startService, "Client service started")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:opacity-90"
                        >
                          Start Service
                        </button>
                      )}
                      {q.status === "in_service" && (
                        <button
                          onClick={() => handleQueueAction(q._id, completeQueue, "Client service marked completed")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:opacity-90"
                        >
                          Complete Service
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm("Cancel and remove this client from the queue waitlist?")) {
                            handleQueueAction(q._id, cancelQueue, "Client queue entry cancelled");
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        Remove
                      </button>
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

export default OwnerQueue;
