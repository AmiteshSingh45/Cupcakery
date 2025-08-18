"use client"; // Ensure it's a client component

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../../Context/cart"; // Import cart context
import { toast } from "react-hot-toast"; // Import toast
import Image from "next/image";

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart, setCart } = useCart(); // Get cart context

  useEffect(() => {
    if (!slug) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(`https://cupcakery-backend.onrender.com/api/v1/product/product-category/${slug}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  const addToCart = (product) => {
    // Prevent duplicate products in the cart
    const isAlreadyInCart = cart.some((item) => item._id === product._id);
    if (isAlreadyInCart) {
      toast.error(`${product.name} is already in your cart!`);
      return;
    }

    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Store cart in localStorage

    toast.success(`${product.name} added to cart!`, {
      position: "top-right",
      duration: 2000,
    });
  };

  if (loading) return <p className="text-center text-lg">Loading products...</p>;
  if (!products.length) return <p className="text-center text-lg text-gray-600 mt-6">No products found in this category.</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center">
        {slug ? slug.toUpperCase() : "Category"} Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded-lg shadow-lg">
            <Image
  src={`http://localhost:4000/api/v1/product/product-photo/${product._id}`}
  alt={product.name}
  width={500}   // ✅ required in Next.js Image
  height={200}  // ✅ required in Next.js Image
  className="w-full h-40 object-cover rounded-md"
/>

            <h2 className="text-lg font-semibold mt-2 text-black">{product.name}</h2>
            <p className="text-gray-600">{product.description.substring(0, 50)}...</p>
            <p className="text-lg font-bold text-gray-800 mt-2">₹{product.price}</p>
            <Link href={`/product/${product._id}`}>
              <button className="mt-4 w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition">
                View Details
              </button>
            </Link>
            <button
              className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
