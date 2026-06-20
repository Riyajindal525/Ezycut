import {
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import {
  getSalonById,
} from "../../api/salon.api";

import {
  getServicesBySalon,
} from "../../api/service.api";

import {
  getSalonReviews,
} from "../../api/review.api";

import ServiceCard from "../../components/salon/ServiceCard";
import ReviewSection from "../../components/review/ReviewSection";

const SalonDetails = () => {

  const { id } =
    useParams();

  const [salon, setSalon] =
    useState(null);

  const [services, setServices] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchData =
      async () => {

        try {

          const salonData =
            await getSalonById(
              id
            );

          setSalon(
            salonData.salon
          );

          const serviceData =
            await getServicesBySalon(
              id
            );

          setServices(
            serviceData.services
          );

          const reviewData =
            await getSalonReviews(
              id
            );

          setReviews(
            reviewData.reviews
          );

        } catch (error) {

          console.log(
            error
          );

        } finally {

          setLoading(
            false
          );

        }
      };

    fetchData();

  }, [id]);

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

  if (!salon) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          Salon Not Found
        </div>

        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">

        <h1 className="text-4xl font-bold">
          {salon.name}
        </h1>

        <p className="mt-4 text-gray-600">
          {salon.address},
          {" "}
          {salon.city}
        </p>

        <div className="mt-4 flex gap-6">

          <span>
            ⭐ {salon.rating}
          </span>

          <span>
            {salon.totalReviews}
            {" "}
            Reviews
          </span>

        </div>

        {/* Services */}

        <div className="mt-10">

          <h2 className="text-2xl font-bold mb-5">
            Services
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            {services.map(
              (service) => (
                <ServiceCard
                  key={
                    service._id
                  }
                  service={
                    service
                  }
                />
              )
            )}

          </div>

        </div>

        {/* Reviews */}

        <ReviewSection
          reviews={reviews}
        />

      </main>

      <Footer />

    </div>
  );
};

export default SalonDetails;