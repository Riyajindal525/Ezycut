import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import {
  getServiceById,
} from "../../api/service.api";

import {
  getAvailableSlots,
} from "../../api/booking.api";

import {
  createOrder,
  verifyPayment,
} from "../../api/payment.api";

const Booking = () => {
  const { serviceId } =
    useParams();

  const navigate =
    useNavigate();

  const [service, setService] =
    useState(null);

  const [date, setDate] =
    useState("");

  const [slots, setSlots] =
    useState([]);

  const [selectedSlot, setSelectedSlot] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchService =
      async () => {
        try {
          const data =
            await getServiceById(
              serviceId
            );

          setService(
            data.service
          );
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

    fetchService();
  }, [serviceId]);

  const handleDateChange =
    async (e) => {
      const selectedDate =
        e.target.value;

      setDate(
        selectedDate
      );

      setSelectedSlot("");

      try {
        const data =
          await getAvailableSlots(
            service.salon,
            service._id,
            selectedDate
          );

        setSlots(
          data.slots
        );
      } catch (error) {
        console.log(error);
      }
    };

  const loadRazorpay =
    () => {
      return new Promise(
        (resolve) => {
          const script =
            document.createElement(
              "script"
            );

          script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

          script.onload =
            () =>
              resolve(true);

          script.onerror =
            () =>
              resolve(false);

          document.body.appendChild(
            script
          );
        }
      );
    };

  const handlePayment =
    async () => {
      if (!date) {
        return alert(
          "Please select a date"
        );
      }

      if (!selectedSlot) {
        return alert(
          "Please select a slot"
        );
      }

      const loaded =
        await loadRazorpay();

      if (!loaded) {
        return alert(
          "Failed to load Razorpay"
        );
      }

      try {
        const orderData =
          await createOrder({
            salonId:
              service.salon,
            serviceId:
              service._id,
            bookingDate:
              date,
            startTime:
              selectedSlot,
            notes,
          });

        const options = {
          key:
            orderData.order.key,

          amount:
            orderData.order.amount,

          currency:
            orderData.order.currency,

          order_id:
            orderData.order.orderId,

          name:
            "EzyCut",

          description:
            service.name,

          handler:
            async function (
              response
            ) {
              try {
                const verify =
                  await verifyPayment({
                    paymentId:
                      orderData.order.paymentId,

                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  });

                console.log(
                  verify
                );

                alert(
                  "Booking Successful 🎉"
                );

                navigate(
                  "/my-bookings"
                );
              } catch (
                error
              ) {
                console.log(
                  error
                );

                alert(
                  "Payment Verification Failed"
                );
              }
            },
        };

        const rzp =
          new window.Razorpay(
            options
          );

        rzp.open();
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data
            ?.message ||
            "Payment Failed"
        );
      }
    };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>

        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          Service not found
        </div>

        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">

        <h1 className="text-3xl font-bold">
          Book Appointment
        </h1>

        <div className="mt-6 border rounded-xl p-6">

          <h2 className="text-2xl font-semibold">
            {service.name}
          </h2>

          <p className="mt-2 text-gray-600">
            {service.description}
          </p>

          <div className="mt-4 flex gap-6">

            <span>
              ₹{service.price}
            </span>

            <span>
              {service.duration}
              mins
            </span>

          </div>

        </div>

        <div className="mt-8">

          <label className="block mb-2 font-medium">
            Select Date
          </label>

          <input
            type="date"
            value={date}
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
            onChange={
              handleDateChange
            }
            className="border rounded-lg p-3"
          />

        </div>

        {slots.length > 0 && (

          <div className="mt-8">

            <h3 className="text-xl font-semibold mb-4">
              Available Slots
            </h3>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">

              {slots.map(
                (slot) => (
                  <button
                    key={slot}
                    onClick={() =>
                      setSelectedSlot(
                        slot
                      )
                    }
                    className={`border rounded-lg p-3 ${
                      selectedSlot ===
                      slot
                        ? "bg-black text-white"
                        : ""
                    }`}
                  >
                    {slot}
                  </button>
                )
              )}

            </div>

          </div>

        )}

        {selectedSlot && (

          <div className="mt-8 border rounded-xl p-5 bg-green-50">

            <p>
              Selected Date:
              {" "}
              {date}
            </p>

            <p>
              Selected Slot:
              {" "}
              {selectedSlot}
            </p>

            <div className="mt-5">

              <label className="block mb-2 font-medium">
                Notes (Optional)
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows="3"
                className="w-full border rounded-lg p-3"
                placeholder="Any special request..."
              />

            </div>

            <button
              onClick={
                handlePayment
              }
              className="mt-5 px-6 py-3 bg-black text-white rounded-lg"
            >
              Pay ₹{service.price}
            </button>

          </div>

        )}

      </main>

      <Footer />

    </div>
  );
};

export default Booking;