import { useNavigate } from "react-router-dom";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    const token =
      localStorage.getItem("token");

    // Not logged in
    if (!token) {
      navigate("/login", {
        state: {
          redirectTo: `/booking/${service._id}`,
        },
      });

      return;
    }

    // Logged in
    navigate(
      `/booking/${service._id}`
    );
  };

  return (
    <div className="border rounded-xl p-5 shadow-sm hover:shadow-md transition">

      <h3 className="text-xl font-semibold">
        {service.name}
      </h3>

      <p className="text-gray-500 mt-2">
        {service.description}
      </p>

      <div className="flex justify-between mt-4">

        <span className="font-medium">
          ₹{service.price}
        </span>

        <span className="text-gray-600">
          {service.duration} mins
        </span>

      </div>

      <div className="mt-5">

        <button
          onClick={handleBookNow}
          className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90"
        >
          Book Now
        </button>

      </div>

    </div>
  );
};

export default ServiceCard;