import {
  useEffect,
  useState,
} from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import {
  getAllSalons,
} from "../../api/salon.api";

import SalonCard from "../../components/salon/SalonCard";

const Salons = () => {

  const [salons, setSalons] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchSalons =
      async () => {

        try {

          const data =
            await getAllSalons();

          const approved =
            data.salons.filter(
              (salon) =>
                salon.isApproved
            );

          setSalons(
            approved
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

    fetchSalons();

  }, []);

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          <h2 className="text-2xl font-semibold">
            Loading Salons...
          </h2>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">

        <h1 className="text-4xl font-bold mb-8">
          Explore Salons
        </h1>

        {salons.length === 0 ? (
          <div className="text-center py-20">

            <h2 className="text-2xl font-semibold">
              No salons found
            </h2>

            <p className="text-gray-500 mt-2">
              Please check again later.
            </p>

          </div>
        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {salons.map(
              (salon) => (
                <SalonCard
                  key={
                    salon._id
                  }
                  salon={
                    salon
                  }
                />
              )
            )}

          </div>

        )}

      </main>

      <Footer />

    </div>
  );
};

export default Salons;