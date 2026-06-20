import { Link } from "react-router-dom";

const SalonCard = ({
  salon,
}) => {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition">

      <h2 className="text-xl font-bold">
        {salon.name}
      </h2>

      <p className="text-gray-500 mt-2">
        {salon.address},{" "}
        {salon.city}
      </p>

      <div className="flex justify-between mt-4">

        <span>
          ⭐ {salon.rating}
        </span>

        <span>
          {salon.totalReviews}
          {" "}reviews
        </span>

      </div>

      <div className="mt-3 text-sm text-gray-600">

        {salon.openingTime}
        {" - "}
        {salon.closingTime}

      </div>

      <Link
        to={`/salons/${salon._id}`}
        className="block mt-5 text-center bg-black text-white py-2 rounded-lg"
      >
        View Details
      </Link>

    </div>
  );
};

export default SalonCard;