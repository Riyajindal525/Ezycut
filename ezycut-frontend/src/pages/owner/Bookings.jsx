import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { getAllSalons } from "../../api/salon.api";
import {
  getSalonBookings,
  completeBooking,
  markNoShow,
  ownerCancelBooking,
} from "../../api/booking.api";

const OwnerBookings = () => {
  const user = useAuthStore((state) => state.user);
  const [salon, setSalon] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSalonAndBookings = async () => {
    try {
      const salonsResponse = await getAllSalons();
      const ownerSalon = salonsResponse.salons.find(
        (s) => s.owner?._id === user?.id || s.owner === user?.id
      );

      if (ownerSalon) {
        setSalon(ownerSalon);
        const bookingsResponse = await getSalonBookings(ownerSalon._id);
        setBookings(bookingsResponse.bookings);
      } else {
        setError("register_needed");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading salon appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAction = async (bookingId, actionFn, successMessage) => {
    try {
      await actionFn(bookingId);
      alert(successMessage);
      fetchSalonAndBookings(); // Refresh list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update booking status.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-600 border border-green-100";
      case "completed":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "no_show":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "cancelled_by_customer":
      case "cancelled_by_owner":
        return "bg-red-50 text-red-600 border border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-100";
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
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800">{salon?.name} Appointments</h3>
        <p className="text-sm text-gray-400 font-semibold mt-1">View schedules and update reservation statuses</p>
      </div>

      {/* Bookings Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <h4 className="text-xl font-bold text-gray-600">No Appointments Registered</h4>
            <p className="text-gray-400 mt-1 text-sm font-semibold">Customers will see slots and book through your salon page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Time slot</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-bold text-gray-800">{b.customer?.name}</td>
                    <td className="py-4 font-semibold">{b.customer?.phone}</td>
                    <td className="py-4 font-semibold">{b.service?.name}</td>
                    <td className="py-4">{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td className="py-4 font-mono font-bold text-slate-800">{b.startTime} - {b.endTime}</td>
                    <td className="py-4 font-bold text-gray-800">₹{b.totalAmount}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(b.status)}`}>
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-1.5">
                      {b.status === "confirmed" ? (
                        <>
                          <button
                            onClick={() => handleAction(b._id, completeBooking, "Booking marked as completed")}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleAction(b._id, markNoShow, "Booking marked as No Show")}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                          >
                            No Show
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Cancel this booking? Refund will need to be initiated if paid.")) {
                                handleAction(b._id, ownerCancelBooking, "Booking cancelled by owner");
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold italic">No actions available</span>
                      )}
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

export default OwnerBookings;
