import {
  useEffect,
  useState,
} from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../api/notification.api";

const Notifications = () => {

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchNotifications =
    async () => {

      try {

        const data =
          await getNotifications();

        setNotifications(
          data.notifications.filter(
            (n) => !n.isRead
          )
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

  useEffect(() => {

    fetchNotifications();

  }, []);

  const handleRead =
    async (id) => {

      try {

        await markAsRead(id);

        setNotifications(
          (prev) =>
            prev.filter(
              (n) =>
                n._id !== id
            )
        );

      } catch (error) {

        console.log(error);

      }
    };

  const handleReadAll =
    async () => {

      try {

        await markAllAsRead();

        setNotifications([]);

      } catch (error) {

        console.log(error);

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

  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-4xl font-bold">
            Notifications
          </h1>

          {notifications.length >
            0 && (
            <button
              onClick={
                handleReadAll
              }
              className="px-4 py-2 bg-black text-white rounded-lg"
            >
              Mark All Read
            </button>
          )}

        </div>

        {notifications.length ===
        0 ? (

          <div className="border rounded-xl p-10 text-center">

            <h2 className="text-2xl font-semibold">
              No New Notifications
            </h2>

          </div>

        ) : (

          <div className="space-y-4">

            {notifications.map(
              (
                notification
              ) => (

                <div
                  key={
                    notification._id
                  }
                  className="border rounded-xl p-5"
                >

                  <div className="flex justify-between items-start">

                    <div>

                      <h2 className="font-bold text-lg">
                        {
                          notification.title
                        }
                      </h2>

                      <p className="text-gray-600 mt-2">
                        {
                          notification.message
                        }
                      </p>

                      <p className="text-sm text-gray-400 mt-3">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        handleRead(
                          notification._id
                        )
                      }
                      className="px-3 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Read
                    </button>

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

export default Notifications;