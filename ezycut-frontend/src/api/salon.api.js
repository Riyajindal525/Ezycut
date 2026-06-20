import api from "./axios";

export const getAllSalons =
  async () => {
    const response =
      await api.get(
        "/salons"
      );

    return response.data;
  };

export const getSalonById =
  async (id) => {
    const response =
      await api.get(
        `/salons/${id}`
      );

    return response.data;
  };