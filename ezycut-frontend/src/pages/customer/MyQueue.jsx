import {
  useEffect,
  useState,
} from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import {
  getMyQueue,
} from "../../api/queue.api";

const MyQueue = () => {

  const [queue, setQueue] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const fetchQueue =
    async () => {

      try {

        const data =
          await getMyQueue();

        const activeQueue =
          data.queues.find(
            (q) =>
              q.status ===
                "waiting" ||
              q.status ===
                "in_service"
          );

        setQueue(
          activeQueue || null
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

  useEffect(() => {

    fetchQueue();

    const interval =
      setInterval(
        fetchQueue,
        15000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          Loading Queue...
        </div>

        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">

        <h1 className="text-4xl font-bold mb-8">
          My Queue
        </h1>

        {!queue ? (

          <div className="border rounded-xl p-10 text-center">

            <h2 className="text-2xl font-semibold">
              No Active Queue
            </h2>

            <p className="mt-3 text-gray-500">
              Join a queue from your bookings.
            </p>

          </div>

        ) : (

          <div className="border rounded-2xl p-8 shadow-sm">

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-3xl font-bold">
                  {queue.salon.name}
                </h2>

                <p className="text-gray-500 mt-2">
                  {queue.service.name}
                </p>

              </div>

              <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                {queue.status}
              </span>

            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-8">

              <div className="border rounded-xl p-5 text-center">

                <p className="text-gray-500">
                  Token
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  #{queue.tokenNumber}
                </h3>

              </div>

              <div className="border rounded-xl p-5 text-center">

                <p className="text-gray-500">
                  Position
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {queue.position}
                </h3>

              </div>

              <div className="border rounded-xl p-5 text-center">

                <p className="text-gray-500">
                  Wait Time
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {queue.estimatedWaitTime}
                  m
                </h3>

              </div>

            </div>

            <div className="mt-8 border rounded-xl p-5 bg-gray-50">

              <p>
                <strong>
                  Token Code:
                </strong>{" "}
                {queue.tokenCode}
              </p>

              <p className="mt-2">
                <strong>
                  Joined:
                </strong>{" "}
                {new Date(
                  queue.joinedAt
                ).toLocaleString()}
              </p>

            </div>

          </div>

        )}

      </main>

      <Footer />

    </div>
  );
};

export default MyQueue;