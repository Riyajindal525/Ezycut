import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  registerUser,
  loginUser,
} from "../../api/auth.api";

import useAuthStore from "../../store/auth.store";

const Register = () => {
  const navigate =
    useNavigate();

  const setAuth =
    useAuthStore(
      (state) =>
        state.setAuth
    );

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "customer",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        // Register
        await registerUser(
          formData
        );

        // Auto Login
        const loginData =
          await loginUser({
            email:
              formData.email,
            password:
              formData.password,
          });

        setAuth(
          loginData.user,
          loginData.token
        );

        alert(
          "Registration Successful"
        );

        navigate(
          "/salons"
        );
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Registration Failed"
        );
      }
    };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      <div className="hidden lg:flex bg-black text-white flex-col justify-center px-16">

        <h1 className="text-5xl font-bold">
          Join EzyCut
        </h1>

        <p className="mt-6 text-lg text-gray-300">
          Create your account and
          start booking appointments
          in seconds.
        </p>

      </div>

      <div className="flex items-center justify-center px-6">

        <div className="w-full max-w-md border rounded-2xl p-8 shadow-sm">

          <h2 className="text-3xl font-bold">
            Create Account
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-6 space-y-4"
          >

            <input
              type="text"
              name="name"
              placeholder="Name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              className="w-full border rounded-lg p-3"
              required
            />

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
              type="text"
              name="phone"
              placeholder="Phone"
              value={
                formData.phone
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

            <select
              name="role"
              value={
                formData.role
              }
              onChange={
                handleChange
              }
              className="w-full border rounded-lg p-3"
            >
              <option value="customer">
                Customer
              </option>

              <option value="salon_owner">
                Salon Owner
              </option>
            </select>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90"
            >
              Register
            </button>

          </form>

          <p className="mt-5 text-center">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;