"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../../../Context/auth";
import moment from "moment";
import { Select } from "antd";
import AdminMenu from "../../../../components/Adminmenu";
import Image from "next/image";

const { Option } = Select;

const AdminOrders = () => {
  const [status, setStatus] = useState([
    "Not Process",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]);
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();

  const getOrders = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/v1/auth/all-orders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const handleChange = async (orderId, value) => {
    try {
      await axios.put(`/api/v1/auth/order-status/${orderId}`, { status: value });
      getOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-white p-6">
      {/* Sidebar */}
      <div className="w-1/4 pr-6">
        <AdminMenu />
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          All Orders
        </h1>

        {orders?.map((order, index) => (
          <div key={order._id} className="bg-gray-100 shadow-md rounded-lg p-6 mb-6">
            {/* Order Details Table */}
            <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-200 text-gray-800">
                <tr className="text-left">
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Buyer</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Payment</th>
                  <th className="p-3 border">Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border bg-white hover:bg-gray-50 transition">
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border">
                    <Select
                      defaultValue={order?.status}
                      className="w-full"
                      onChange={(value) => handleChange(order._id, value)}
                    >
                      {status.map((s, i) => (
                        <Option key={i} value={s}>
                          {s}
                        </Option>
                      ))}
                    </Select>
                  </td>
                  <td className="p-3 border">{order?.buyer?.name}</td>
                  <td className="p-3 border">{moment(order?.createdAt).fromNow()}</td>
                  <td className="p-3 border font-semibold">
                    {order?.payment.success ? (
                      <span className="text-green-600">Success</span>
                    ) : (
                      <span className="text-red-600">Failed</span>
                    )}
                  </td>
                  <td className="p-3 border">{order?.products?.length}</td>
                </tr>
              </tbody>
            </table>

            {/* Products List */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Products:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {order?.products?.map((product) => {
                  const imageUrl = `http://localhost:4000/api/v1/product/product-photo/${product._id}`;
                  const [imgSrc, setImgSrc] = useState(imageUrl);

                  return (
                    <div
                      key={product._id}
                      className="flex items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition duration-300"
                    >
                      <Image
                        src={imgSrc}
                        alt={product.name}
                        width={64} // Tailwind w-16 = 64px
                        height={64} // Tailwind h-16 = 64px
                        className="w-16 h-16 object-cover rounded-md"
                        onError={() => setImgSrc("/fallback-image.jpg")}
                      />
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-gray-600">
                          {product.description.substring(0, 30)}...
                        </p>
                        <p className="text-gray-800 font-bold">₹{product.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
