import api from "./axios";

export const getAvailableSlots =
  async (
    salonId,
    serviceId,
    date
  ) => {

    const response =
      await api.get(
        `/bookings/available-slots?salonId=${salonId}&serviceId=${serviceId}&date=${date}`
      );

    return response.data;
  };

  export const getMyBookings =
  async () => {
    const response =
      await api.get(
        "/bookings/my-bookings"
      );

    return response.data;
  };

export const cancelBooking =
  async (bookingId) => {
    const response =
      await api.patch(
        `/bookings/${bookingId}/cancel`
      );

    return response.data;
  };