"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://cupcakery-backend.onrender.com/api/v1/auth/register", {
        name,
        email,
        password,
        phone,
        address,
        answer,
      });

      if (res.data && res.data.success) {
        toast.success(res.data.message);
        router.push("/Login"); // Redirect to login page
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Fields */}
          {[
            { label: "Full Name", type: "text", value: name, setValue: setName },
            { label: "Email Address", type: "email", value: email, setValue: setEmail },
            { label: "Password", type: "password", value: password, setValue: setPassword },
            { label: "Phone Number", type: "text", value: phone, setValue: setPhone },
            { label: "Address", type: "text", value: address, setValue: setAddress },
            { label: "Security Question (Answer)", type: "text", value: answer, setValue: setAnswer },
          ].map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.setValue(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500"
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                required
              />
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register
          </button>
        </form>

        {/* Already have an account? */}
        <p className="text-center text-gray-600 text-sm mt-4">
          Already have an account?{" "}
          <Link href="/Login" className="text-blue-500 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
