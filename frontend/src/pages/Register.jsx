import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/users/register", formData);
      // localStorage.setItem("token", res.data.token);
      // setUser(res.data);
      console.log(res.data);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Check console for details."
      );
      alert(JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Employee Registration
        </h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Username
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none focus:border-blue-400"
              type="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Email
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none focus:border-blue-400"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none focus:border-blue-400"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>
          <button className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 font-medium cursor-pointer">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
