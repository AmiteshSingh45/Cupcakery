"use client";
import React, { useState } from "react";

const CustomOrder = () => {
  const [size, setSize] = useState("1 kg");
  const [flavor, setFlavor] = useState("Chocolate");

  return (
    <div className="bg-white min-h-screen flex flex-col items-center py-12 px-6 text-gray-900">
      {/* Header */}
      <h1 className="text-4xl font-bold text-purple-700 text-center">Design Your Own Cake 🎂</h1>
      <p className="mt-2 text-gray-600 text-lg text-center max-w-2xl">
        Looking for the perfect celebration cake for your loved ones? Order now and let our cake experts deliver happiness!
      </p>

      {/* Delivery Info */}
      <div className="bg-gray-100 shadow-lg rounded-lg p-6 mt-6 w-full max-w-3xl border border-gray-300">
        <h2 className="text-2xl font-semibold text-center text-yellow-600">Delivery Information 🚚</h2>
        <p className="text-lg text-center mt-2 text-gray-700">
          Currently available in Surat. Orders must be placed 24 hours in advance.
        </p>
      </div>

      {/* Custom Cake Order Form */}
      <div className="bg-gray-100 shadow-lg rounded-lg p-8 mt-8 w-full max-w-3xl border border-gray-300">
        <h2 className="text-2xl font-semibold text-center text-pink-600">Customize Your Cake 🍰</h2>

        <form className="mt-6 flex flex-col gap-4">
          {/* Delivery Date & Time */}
          <div>
            <label className="block text-lg font-medium text-gray-800">Delivery Date & Time:</label>
            <div className="flex gap-4">
              <input
                type="date"
                className="border border-gray-400 p-3 rounded-lg w-1/2 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
              <input
                type="time"
                className="border border-gray-400 p-3 rounded-lg w-1/2 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Cake Type */}
          <div>
            <label className="block text-lg font-medium text-gray-800">Cake Type:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="cakeType" value="Egg" className="accent-purple-500" required />
                Egg Cake
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="cakeType" value="Eggless" className="accent-purple-500" required />
                Eggless Cake
              </label>
            </div>
          </div>

          {/* Cake Size */}
          <div>
            <label className="block text-lg font-medium text-gray-800">Cake Size:</label>
            <select
              className="border border-gray-400 p-3 rounded-lg w-full bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              <option value="250 gm">250 gm</option>
              <option value="500 gm">500 gm</option>
              <option value="1 kg">1 kg</option>
              <option value="2 kg">2 kg</option>
              <option value="4 kg">4 kg</option>
            </select>
          </div>

          {/* Select Flavor */}
          <div>
            <label className="block text-lg font-medium text-gray-800">Select Flavor:</label>
            <select
              className="border border-gray-400 p-3 rounded-lg w-full bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={flavor}
              onChange={(e) => setFlavor(e.target.value)}
            >
              <option value="Chocolate">Chocolate</option>
              <option value="Blackforest">Blackforest</option>
              <option value="Vanilla">Vanilla</option>
              <option value="Butter Scotch">Butter Scotch</option>
              <option value="Strawberry">Strawberry</option>
              <option value="Pineapple">Pineapple</option>
            </select>
          </div>

          {/* Additional Message */}
          <div>
            <label className="block text-lg font-medium text-gray-800">Additional Message:</label>
            <textarea
              className="border border-gray-400 p-3 rounded-lg w-full h-20 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Write a message for the cake..."
            ></textarea>
          </div>

          {/* Personal Information */}
          <h2 className="text-2xl font-semibold text-center text-pink-600 mt-6">Personal Information 📝</h2>

          <input type="text" placeholder="Full Name" className="border border-gray-400 p-3 rounded-lg w-full bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none" required />
          <input type="tel" placeholder="Contact Number" className="border border-gray-400 p-3 rounded-lg w-full bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none" required />
          <input type="email" placeholder="Email" className="border border-gray-400 p-3 rounded-lg w-full bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none" required />
          <textarea placeholder="Delivery Address" className="border border-gray-400 p-3 rounded-lg w-full h-24 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none" required></textarea>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Submit Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomOrder;
