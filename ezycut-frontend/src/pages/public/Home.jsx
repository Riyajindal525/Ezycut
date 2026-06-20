import { Link } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import useAuthStore from "../../store/auth.store";

const Home = () => {
  const token = useAuthStore(
    (state) => state.token
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <Navbar />

      {/* Hero Section */}

      <section className="flex flex-col items-center justify-center text-center px-6 py-24">

        <h1 className="text-5xl font-bold max-w-3xl">
          Book Salon Appointments
          Without Waiting
        </h1>

        <p className="mt-6 text-gray-600 text-lg max-w-2xl">
          Discover salons, book appointments,
          track queues in real time and manage
          your grooming experience from one place.
        </p>

        <div className="mt-10 flex gap-4">

          <Link
            to="/salons"
            className="px-8 py-3 rounded-xl bg-black text-white hover:opacity-90"
          >
            Explore Salons
          </Link>

          {!token && (
            <Link
              to="/register"
              className="px-8 py-3 rounded-xl border hover:bg-gray-100"
            >
              Get Started
            </Link>
          )}

        </div>

      </section>

      {/* Features */}

      <section className="grid md:grid-cols-3 gap-6 px-8 py-16 max-w-7xl mx-auto w-full">

        <div className="border rounded-2xl p-6 shadow-sm">

          <h3 className="font-semibold text-xl">
            Easy Booking
          </h3>

          <p className="mt-3 text-gray-600">
            Find available slots and book
            appointments instantly.
          </p>

        </div>

        <div className="border rounded-2xl p-6 shadow-sm">

          <h3 className="font-semibold text-xl">
            Queue Tracking
          </h3>

          <p className="mt-3 text-gray-600">
            Monitor queue status in real time
            and avoid unnecessary waiting.
          </p>

        </div>

        <div className="border rounded-2xl p-6 shadow-sm">

          <h3 className="font-semibold text-xl">
            Verified Reviews
          </h3>

          <p className="mt-3 text-gray-600">
            Make informed decisions through
            genuine customer feedback.
          </p>

        </div>

      </section>

      {/* How It Works */}

      <section className="py-20 px-8 bg-gray-50">

        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12">

            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                1
              </div>

              <h3 className="mt-4 text-xl font-semibold">
                Choose Salon
              </h3>

              <p className="mt-2 text-gray-600">
                Explore verified salons near you.
              </p>

            </div>

            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                2
              </div>

              <h3 className="mt-4 text-xl font-semibold">
                Book Appointment
              </h3>

              <p className="mt-2 text-gray-600">
                Select service, date and time slot.
              </p>

            </div>

            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                3
              </div>

              <h3 className="mt-4 text-xl font-semibold">
                Skip Waiting
              </h3>

              <p className="mt-2 text-gray-600">
                Arrive on time and avoid queues.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="text-center py-20">

        <h2 className="text-3xl font-bold">
          Ready To Book Your Next Appointment?
        </h2>

        {!token ? (
          <Link
            to="/register"
            className="inline-block mt-6 px-8 py-3 rounded-xl bg-black text-white hover:opacity-90"
          >
            Join EzyCut
          </Link>
        ) : (
          <Link
            to="/salons"
            className="inline-block mt-6 px-8 py-3 rounded-xl bg-black text-white hover:opacity-90"
          >
            Explore Salons
          </Link>
        )}

      </section>

      <Footer />

    </div>
  );
};

export default Home;