import {
  useEffect,
  useState,
} from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  joinQueue,
} from "../../api/queue.api";

import {
  getMyBookings,
  cancelBooking,
} from "../../api/booking.api";

const MyBookings = () => {
  const [bookings, setBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchBookings =
    async () => {
      try {
        const data =
          await getMyBookings();

        setBookings(
          data.bookings
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel =
    async (bookingId) => {
      const confirmCancel =
        window.confirm(
          "Are you sure you want to cancel this booking?"
        );

      if (!confirmCancel)
        return;

      try {
        await cancelBooking(
          bookingId
        );

        alert(
          "Booking Cancelled Successfully"
        );

        fetchBookings();
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Cancellation Failed"
        );
      }
    };

  const handleJoinQueue =
  async (bookingId) => {

    try {

      const data =
        await joinQueue(
          bookingId
        );

      alert(
        data.message
      );

    } catch (error) {

      alert(
        error.response?.data
          ?.message ||
          "Failed to join queue"
      );
    }
  };  

  const getStatusColor =
    (status) => {
      switch (status) {
        case "confirmed":
          return "bg-green-100 text-green-700";

        case "cancelled":
        case "cancelled_by_owner":
          return "bg-red-100 text-red-700";

        case "completed":
          return "bg-blue-100 text-blue-700";

        default:
          return "bg-gray-100 text-gray-700";
      }
    };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          Loading Bookings...
        </div>

        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        <h1 className="text-4xl font-bold mb-8">
          My Bookings
        </h1>

        {bookings.length ===
        0 ? (
          <div className="border rounded-xl p-10 text-center">

            <h2 className="text-2xl font-semibold">
              No Bookings Found
            </h2>

            <p className="text-gray-500 mt-2">
              Book your first salon appointment.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {bookings.map(
              (booking) => (
                <div
                  key={
                    booking._id
                  }
                  className="border rounded-xl p-6 shadow-sm"
                >

                  <div className="flex flex-col md:flex-row md:justify-between gap-4">

                    <div>

                      <h2 className="text-2xl font-semibold">
                        {
                          booking
                            .salon
                            .name
                        }
                      </h2>

                      <p className="text-gray-600 mt-1">
                        {
                          booking
                            .service
                            .name
                        }
                      </p>

                      <p className="mt-3">
                        📅{" "}
                        {new Date(
                          booking.bookingDate
                        ).toLocaleDateString()}
                      </p>

                      <p>
                        ⏰{" "}
                        {
                          booking.startTime
                        }
                        {" - "}
                        {
                          booking.endTime
                        }
                      </p>

                      <p>
                        💰 ₹
                        {
                          booking.totalAmount
                        }
                      </p>

                      {booking.notes && (
                        <p className="mt-2 text-gray-600">
                          📝{" "}
                          {
                            booking.notes
                          }
                        </p>
                      )}

                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {
                          booking.status
                        }
                      </span>

                      {booking.status ===
  "confirmed" && (

  <>
    <button
      onClick={() =>
        handleJoinQueue(
          booking._id
        )
      }
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      Join Queue
    </button>

    <button
      onClick={() =>
        handleCancel(
          booking._id
        )
      }
      className="px-4 py-2 bg-red-500 text-white rounded-lg"
    >
      Cancel Booking
    </button>
  </>

)}

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </main>

      <Footer />

    </div>
  );
};

export default MyBookings;