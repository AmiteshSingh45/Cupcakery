"use client";
import React from "react";

const Contact = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center py-12 px-6">
      {/* Header */}
      <h1 className="text-4xl font-bold text-purple-600">Contact Us</h1>
      <p className="mt-2 text-gray-700 text-lg">We would love to hear from you!</p>

      {/* Contact Details Section */}
      <div className="bg-gray-100 shadow-lg rounded-lg p-8 mt-6 w-full max-w-3xl border border-gray-300">
        <h2 className="text-2xl font-semibold text-center text-pink-500">Our Cafes</h2>
        <p className="text-lg text-center mt-2 text-gray-700">
          Parle Point, Surat, Gujarat, India
        </p>

        <div className="mt-6">
          <h3 className="text-xl font-medium text-purple-600">📞 Call Us</h3>
          <p className="text-gray-600">9831371927 (10 AM - 7 PM)</p>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-medium text-purple-600">📩 Email Us</h3>
          {/* ✅ Escaped apostrophe */}
          <p className="text-gray-600">feedback@Bindi&apos;sCupcakery.com</p>
        </div>

        <div className="mt-6 text-center">
          <h3 className="text-xl font-medium text-purple-600">📢 Follow Us</h3>
          <div className="flex justify-center gap-4 mt-2">
            <a
              href="https://www.instagram.com/bindis_cupcakery"
              target="_blank"
              rel="noopener noreferrer" // ✅ security fix
              className="text-pink-500 hover:text-pink-700 transition duration-300"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/bindi.malji"
              target="_blank"
              rel="noopener noreferrer" // ✅ security fix
              className="text-blue-500 hover:text-blue-700 transition duration-300"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-100 shadow-lg rounded-lg p-8 mt-8 w-full max-w-3xl border border-gray-300">
        <h2 className="text-2xl font-semibold text-center text-pink-500">Get in Touch</h2>
        <p className="text-gray-700 text-center mt-2">
          Our team is here to assist you with private parties or bulk orders.
        </p>

        <form className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            className="border border-gray-300 p-3 rounded-lg w-full bg-white text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 p-3 rounded-lg w-full bg-white text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="border border-gray-300 p-3 rounded-lg w-full bg-white text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            required
          />
          <textarea
            placeholder="Type your message..."
            className="border border-gray-300 p-3 rounded-lg w-full h-28 bg-white text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            required
          ></textarea>
          <button
            type="submit"
            className="w-full bg-purple-400 hover:bg-purple-500 text-white font-bold py-3 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
