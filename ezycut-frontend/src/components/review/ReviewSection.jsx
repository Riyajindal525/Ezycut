const ReviewSection = ({
  reviews,
}) => {
  return (
    <div className="mt-12">

      <h2 className="text-2xl font-bold mb-5">
        Customer Reviews
      </h2>

      {reviews.length === 0 ? (
        <div className="border rounded-xl p-5">
          No Reviews Yet
        </div>
      ) : (
        <div className="space-y-4">

          {reviews.map(
            (review) => (
              <div
                key={
                  review._id
                }
                className="border rounded-xl p-5"
              >

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold">
                    {
                      review
                        .customer
                        ?.name
                    }
                  </h3>

                  <span>
                    {"⭐".repeat(
                      review.rating
                    )}
                  </span>

                </div>

                <p className="mt-3 text-gray-600">
                  {
                    review.comment
                  }
                </p>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
};

export default ReviewSection;