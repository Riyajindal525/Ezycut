import api from "./axios";

export const joinQueue =
  async (bookingId) => {

    const response =
      await api.post(
        "/queue/join",
        {
          bookingId,
        }
      );

    return response.data;
  };

export const getMyQueue =
  async () => {

    const response =
      await api.get(
        "/queue/my-status"
      );

    return response.data;
  };