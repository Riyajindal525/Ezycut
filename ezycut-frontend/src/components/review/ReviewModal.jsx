import {
  useState,
} from "react";

import {
  createReview,
} from "../../api/review.api";

const ReviewModal = ({
  bookingId,
  onClose,
}) => {

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const handleSubmit =
    async () => {

      try {

        await createReview({
          bookingId,
          rating,
          comment,
        });

        alert(
          "Review submitted successfully"
        );

        onClose();

      } catch (error) {

        alert(
          error.response?.data
            ?.message ||
            "Review Failed"
        );

      }
    };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-full max-w-md">

        <h2 className="text-2xl font-bold mb-4">
          Write Review
        </h2>

        <label className="block mb-2">
          Rating
        </label>

        <select
          value={rating}
          onChange={(e) =>
            setRating(
              Number(
                e.target.value
              )
            )
          }
          className="w-full border rounded-lg p-3"
        >
          <option value={5}>
            ⭐⭐⭐⭐⭐
          </option>

          <option value={4}>
            ⭐⭐⭐⭐
          </option>

          <option value={3}>
            ⭐⭐⭐
          </option>

          <option value={2}>
            ⭐⭐
          </option>

          <option value={1}>
            ⭐
          </option>
        </select>

        <textarea
          value={comment}
          onChange={(e) =>
            setComment(
              e.target.value
            )
          }
          rows="4"
          placeholder="Write your review..."
          className="w-full border rounded-lg p-3 mt-4"
        />

        <div className="flex gap-3 mt-5">

          <button
            onClick={
              handleSubmit
            }
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            Submit
          </button>

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
};

export default ReviewModal;