import {
  useEffect,
  useState,
} from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import {
  getMyPayments,
} from "../../api/payment.api";

const PaymentHistory = () => {

  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchPayments =
      async () => {

        try {

          const data =
            await getMyPayments();

          setPayments(
            data.payments
          );

        } catch (error) {

          console.log(error);

        } finally {

          setLoading(false);

        }
      };

    fetchPayments();

  }, []);

  const getStatusColor =
    (status) => {

      switch (status) {

        case "paid":
          return "bg-green-100 text-green-700";

        case "created":
          return "bg-yellow-100 text-yellow-700";

        case "failed":
          return "bg-red-100 text-red-700";

        default:
          return "bg-gray-100 text-gray-700";
      }
    };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading Payments...
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
          Payment History
        </h1>

        {payments.length === 0 ? (

          <div className="border rounded-xl p-10 text-center">

            <h2 className="text-2xl font-semibold">
              No Payments Found
            </h2>

          </div>

        ) : (

          <div className="space-y-5">

            {payments.map(
              (payment) => (

                <div
                  key={payment._id}
                  className="border rounded-xl p-6 shadow-sm"
                >

                  <div className="flex flex-col md:flex-row md:justify-between gap-4">

                    <div>

                      <h2 className="text-xl font-semibold">
                        {payment.salon?.name}
                      </h2>

                      <p className="text-gray-600">
                        {payment.service?.name}
                      </p>

                      <p className="mt-3">
                        💰 ₹{payment.amount}
                      </p>

                      <p>
                        📅 {new Date(
                          payment.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <p>
                        🏙️ {payment.salon?.city}
                      </p>

                      {payment.booking && (
                        <p>
                          Booking Status:
                          {" "}
                          {payment.booking.status}
                        </p>
                      )}

                    </div>

                    <div className="flex flex-col gap-3">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                        Refund:
                        {" "}
                        {payment.refundStatus}
                      </span>

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

export default PaymentHistory;