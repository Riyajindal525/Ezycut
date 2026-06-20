import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { loginUser } from "../../api/auth.api";
import useAuthStore from "../../store/auth.store";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    location.state?.redirectTo;

  const setAuth = useAuthStore(
    (state) => state.setAuth
  );

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data =
        await loginUser(
          formData
        );

      setAuth(
        data.user,
        data.token
      );

      alert(
        "Login Successful"
      );

      navigate(
        redirectTo ||
          "/salons"
      );
    } catch (error) {
      alert(
        error.response?.data
          ?.message ||
          "Login Failed"
      );
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      <div className="hidden lg:flex bg-black text-white flex-col justify-center px-16">

        <h1 className="text-5xl font-bold">
          EzyCut
        </h1>

        <p className="mt-6 text-lg text-gray-300">
          Book appointments,
          skip queues and manage
          your salon visits effortlessly.
        </p>

      </div>

      <div className="flex items-center justify-center px-6">

        <div className="w-full max-w-md border rounded-2xl p-8 shadow-sm">

          <h2 className="text-3xl font-bold">
            Welcome Back
          </h2>

          <p className="text-gray-500 mt-2">
            Login to continue
          </p>

          {redirectTo && (
            <div className="mt-4 mb-4 p-3 rounded-lg bg-yellow-100 text-yellow-800">
              Please login to continue your booking.
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-6 space-y-4"
          >

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              className="w-full border rounded-lg p-3"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              className="w-full border rounded-lg p-3"
              required
            />

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90"
            >
              Login
            </button>

          </form>

          <p className="mt-5 text-center">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold"
            >
              Register
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;