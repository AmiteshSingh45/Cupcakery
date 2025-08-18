'use client';
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();

  // Request OTP
  const requestOtp = async () => {
    try {
      const res = await axios.post("https://cupcakery-backend.onrender.com/api/v1/auth/request-otp", { email });
      if (res.data.success) {
        toast.success("OTP sent to your email/phone");
        setOtpSent(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    }
  };

  // Verify OTP & Reset Password
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://cupcakery-backend.onrender.com/api/v1/auth/verify-otp", {
        email,
        otp,
        newPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        router.push("/Login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="w-full max-w-lg bg-gray-900 text-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center mb-6">Reset Password</h2>
        {!otpSent ? (
          <div className="space-y-4">
            <label className="block text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white"
              placeholder="Enter your email"
              required
            />
            <button
              onClick={requestOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg mt-4"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-gray-300">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white"
              placeholder="Enter OTP"
              required
            />
            <label className="block text-gray-300">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white"
              placeholder="Enter your new password"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-lg mt-4"
            >
              Verify OTP & Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
