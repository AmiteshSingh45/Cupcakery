"use client";
import React, { useState, useEffect } from "react";
import UserMenu from "./../../../../components/Usermenu";
import axios from "axios";
import { useAuth } from "../../../../Context/auth";
import moment from "moment";
import Image from "next/image";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();

  const getOrders = async () => {
    try {
      const { data } = await axios.get("https://cupcakery-backend.onrender.com/api/v1/auth/orders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <div className="flex flex-wrap">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 p-4">
          <UserMenu />
        </div>

        {/* Orders Section */}
        <div className="w-full md:w-3/4 p-4">
          <h1 className="text-3xl text-black font-semibold text-center mb-6">
            Your Orders
          </h1>

          {orders?.map((o, i) => (
            <div
              key={i}
              className="mb-6 bg-gray-100 rounded-xl shadow-md p-6"
            >
              {/* Order Details Table */}
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr className="text-gray-700 text-left">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Buyer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300 text-gray-800">
                    <td className="py-3 px-4">{i + 1}</td>
                    <td className="py-3 px-4">{o?.status}</td>
                    <td className="py-3 px-4">{o?.buyer?.name}</td>
                    <td className="py-3 px-4">
                      {moment(o?.createdAt).fromNow()}
                    </td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        o?.payment.success
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {o?.payment.success ? "Success" : "Failed"}
                    </td>
                    <td className="py-3 px-4">{o?.products?.length}</td>
                  </tr>
                </tbody>
              </table>

              {/* Product List */}
              <div className="space-y-4 mt-4">
                {o?.products?.map((p) => {
                  const imageUrl = `https://cupcakery-backend.onrender.com/api/v1/product/product-photo/${p._id}`;
                  return (
                    <div
                      key={p._id}
                      className="flex items-center bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 relative">
                        <Image
                          src={imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = "/fallback.png"; // replace with your fallback image
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="w-3/4 pl-4">
                        <p className="font-semibold text-lg">{p.name}</p>
                        <p className="text-sm text-gray-600">
                          {p.description?.substring(0, 50)}...
                        </p>
                        <p className="text-lg text-blue-600 font-medium">
                          Price: ₹{p.price}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
