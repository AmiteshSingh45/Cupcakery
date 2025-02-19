"use client";
import React, { useState, useEffect } from "react";
import { Checkbox, Radio } from "antd";
import { Prices } from "../../price/price";
import { useCart } from "../../Context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [loading, setLoading] = useState(false);
  const { cart, setCart } = useCart([]);

  useEffect(() => {
    getAllCategory();
    getAllProducts();
  }, []);

  useEffect(() => {
    if (checked.length || radio.length) {
      filterProduct();
    } else {
      getAllProducts(); // Show all products when no filters are applied
    }
  }, [checked, radio]);

  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/v1/category/get-category");
      if (data?.success) setCategories(data?.category);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:4000/api/v1/product/product-list");
      console.log("Fetched Products:", data); // Debugging Log
      setLoading(false);
      if (data?.products) setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching products:", error);
    }
  };
  

  const handleFilter = (value, id) => {
    let updatedChecked = [...checked];
    if (value) {
      updatedChecked.push(id);
    } else {
      updatedChecked = updatedChecked.filter((c) => c !== id);
    }

    setChecked(updatedChecked);

    // If no checkboxes are ticked, show all products
    if (updatedChecked.length === 0 && radio.length === 0) {
      getAllProducts();
    }
  };

  const filterProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("http://localhost:4000/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setLoading(false);
      if (data?.products) setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.error("Error filtering products:", error);
    }
  };

  const handleAddToCart = (product) => {
    if (!Array.isArray(cart)) setCart([]);
    setCart((prevCart) => [...prevCart, product]);
    toast.success("Item Added to Cart");
  };

  return (
    <div className="bg-white text-black min-h-screen p-6">
      <div className="container mx-auto flex flex-col md:flex-row gap-8">
        {/* Filters Section */}
        <div className="md:w-1/4 bg-white p-6 rounded-lg shadow-lg">
          {/* Filter By Category Section */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4 text-gray-800 text-center">Filter By Category</h4>
            <div className="space-y-3">
              {categories?.map((c) => (
                <label key={c._id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    onChange={(e) => handleFilter(e.target.checked, c._id)}
                    className="form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-400"
                  />
                  <span className="text-gray-700">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-gray-200" /> 

          {/* Filter By Price Section */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4 text-gray-800 text-center">Filter By Price</h4>
            <div className="space-y-3">
              {Prices?.map((p) => (
                <label key={p._id} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="price"
                    value={p.array}
                    onChange={() => setRadio(p.array)}
                    className="form-radio h-5 w-5 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-gray-700">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Filters Button */}
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              setChecked([]);
              setRadio([]);
              getAllProducts();
            }}
          >
            RESET FILTERS
          </button>
        </div>

        {/* Products Section */}
        <div className="md:w-3/4">
          <h1 className="text-3xl font-extrabold text-center text-gray-700">All Products</h1>
          {loading ? (
            <p className="text-center text-gray-500 mt-6">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {products.map((p) => (
                <div key={p._id} className="bg-white p-4 rounded-lg shadow-lg">
                  <Image
                    src={`http://localhost:4000/api/v1/product/product-photo/${p._id}`}
                    alt={p.name}
                    width={300}
                    height={300}
                    className="w-full h-56 object-cover rounded-md"
                  />
                  <div className="mt-4">
                    <h5 className="text-xl font-semibold">{p.name}</h5>
                    <p className="text-gray-600 text-sm mt-1">{p.description.substring(0, 50)}...</p>
                    <p className="text-blue-500 font-bold mt-2">₹ {p.price}</p>

                    {/* Buttons in Same Row with Styling */}
                    <div className="mt-4 flex justify-between items-center">
                      <Link href={`/products/${p.slug}`} passHref>
                        <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-all font-semibold text-sm w-full">
                          More Details
                        </button>
                      </Link>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-all font-semibold text-sm w-full"
                        onClick={() => handleAddToCart(p)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-6">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
