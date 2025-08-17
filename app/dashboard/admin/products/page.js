"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import AdminMenu from "../../../../components/Adminmenu";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);

  const fallbackImage = "https://via.placeholder.com/150";

  // Get token from localStorage after component mounts
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    setToken(auth?.token);
  }, []);

  const getAllProducts = useCallback(async () => {
    if (!token) return; // wait until token is loaded
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/product/get-product",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(data.products);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while fetching products.");
    }
  }, [token]);

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  return (
    <div className="container mx-auto p-6 bg-white text-black min-h-screen">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 bg-gray-800 text-white p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4 text-white text-center">
            Admin Menu
          </h2>
          <AdminMenu />
        </div>

        <div className="w-full md:w-3/4 mt-6 md:mt-0">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
            All Products
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((p) => (
              <Link
                key={p._id}
                href={`/dashboard/admin/product/${p.slug}`}
                passHref
              >
                <div className="card bg-gray-100 border border-gray-300 rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300 cursor-pointer">
                  <Image
                    src={`http://localhost:4000/api/v1/product/product-photo/${p._id}`}
                    alt={p.name}
                    width={400}
                    height={224}
                    className="w-full h-56 object-cover rounded-md mb-4"
                    onError={(e) => {
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div className="card-body">
                    <h5 className="card-title text-lg font-bold text-gray-900">
                      {p.name}
                    </h5>
                    <p className="card-text text-gray-700 text-sm truncate">
                      {p.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
