"use client";

import { useCart } from "../../../Context/cart";
import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useParams } from "next/navigation"; // Import useParams

const ProductDetail = () => {
  const { slug } = useParams(); // Get product slug
  const { cart, setCart } = useCart([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return; // Prevent unnecessary API calls

      try {
        const res = await fetch(
          `http://localhost:4000/api/v1/product/get-product/${slug}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (res.ok && data.product) {
          setProduct(data.product);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    
    setCart((prevCart) => (Array.isArray(prevCart) ? [...prevCart, product] : [product]));
    
    toast.success("Item Added to Cart");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-center text-gray-500 text-lg">Loading product details...</p>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-center text-red-500 text-lg">Product not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-6 bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Product Image Section */}
          <div className="p-6 flex justify-center items-center bg-gray-100">
            <Image
              src={`http://localhost:4000/api/v1/product/product-photo/${product._id}`}
              alt={product.name}
              width={450}
              height={450}
              className="rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Product Details Section */}
          <div className="p-6 flex flex-col justify-center">
            <h1 className="sechead text-black">{product.name}</h1>
            <p className="text-gray-600 text-lg mb-4 leading-relaxed">{product.description}</p>
            <p className="text-2xl font-semibold text-gray-900 mb-6">
              Price: <span className="text-blue-600">₹{product.price}</span>
            </p>

            {/* Add to Cart Button */}
            <button
              className="w-full bg-blue-400 hover:bg-blue-500 text-white text-lg font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
              onClick={handleAddToCart}
            >
              ADD TO CART
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
