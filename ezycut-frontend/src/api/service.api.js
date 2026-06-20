import api from "./axios";

export const getServicesBySalon =
  async (salonId) => {
    const response =
      await api.get(
        `/services/salon/${salonId}`
      );

    return response.data;
  };

export const getServiceById =
  async (id) => {
    const response =
      await api.get(
        `/services/${id}`
      );

    return response.data;
  };