import {
  useEffect,
  useState,
} from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import {
  getMyReviews,
} from "../../api/review.api";

const MyReviews = () => {

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchReviews =
      async () => {

        try {

          const data =
            await getMyReviews();

          setReviews(
            data.reviews
          );

        } catch (error) {

          console.log(error);

        } finally {

          setLoading(false);

        }
      };

    fetchReviews();

  }, []);

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          Loading Reviews...
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
          My Reviews
        </h1>

        {reviews.length === 0 ? (

          <div className="border rounded-xl p-10 text-center">

            <h2 className="text-2xl font-semibold">
              No Reviews Found
            </h2>

          </div>

        ) : (

          <div className="space-y-5">

            {reviews.map(
              (review) => (

                <div
                  key={review._id}
                  className="border rounded-xl p-6 shadow-sm"
                >

                  <div className="flex justify-between items-center">

                    <h2 className="text-xl font-semibold">
                      {review.salon?.name ||
                        "Salon"}
                    </h2>

                    <span>
                      {"⭐".repeat(
                        review.rating
                      )}
                    </span>

                  </div>

                  <p className="mt-4 text-gray-600">
                    {review.comment}
                  </p>

                  <p className="mt-4 text-sm text-gray-500">
                    {new Date(
                      review.createdAt
                    ).toLocaleDateString()}
                  </p>

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

export default MyReviews;