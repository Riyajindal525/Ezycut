import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Salons from "../pages/public/Salons";
import SalonDetails
from "../pages/public/SalonDetails";
import Booking from "../pages/public/Booking";
import MyBookings from "../pages/customer/MyBookings";
import PaymentHistory from "../pages/customer/PaymentHistory";
import MyReviews from "../pages/customer/MyReviews";
import Notifications
from "../pages/customer/Notifications";
import MyQueue from "../pages/customer/MyQueue";

const AppRoutes =
  () => {
    return (
      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
  path="/salons"
  element={<Salons />}
/>
    <Route
  path="/salons/:id"
  element={
    <SalonDetails />
  }
/>
 <Route
  path="/booking/:serviceId"
  element={<Booking />}
/>
     <Route
  path="/my-bookings"
  element={<MyBookings />}
/>
     <Route
  path="/payment-history"
  element={<PaymentHistory />}
/>
<Route
  path="/my-reviews"
  element={<MyReviews />}
/>



       <Route
  path="/notifications"
  element={
    <Notifications />
  }
/>
<Route
  path="/my-queue"
  element={<MyQueue />}
/>
        </Routes>
      </BrowserRouter>
    );
  };

export default AppRoutes;