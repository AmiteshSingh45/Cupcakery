"use client"; // Ensures it's a client-side component

import { useSearch } from "../../Context/search";
import Link from "next/link";
import Image from "next/image";

const Search = () => {
  const { search } = useSearch();

  return (
    <div className="container mx-auto py-10 px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Search Results</h1>
        <h6 className="text-lg text-gray-600 mt-2">
          {search?.results.length < 1
            ? "No Products Found"
            : `Found ${search?.results.length} products`}
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {search?.results.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded-lg shadow-lg">
              <div className="relative w-full h-40">
                <Image
                  src={`/api/v1/product/product-photo/${p._id}`}
                  alt={p.name}
                  fill
                  className="object-cover rounded-md"
                  unoptimized // ✅ Use this if images are coming from API without optimization
                />
              </div>
              <h5 className="text-lg font-semibold mt-2">{p.name}</h5>
              <p className="text-gray-600">{p.description.substring(0, 30)}...</p>
              <p className="text-lg font-bold text-gray-800 mt-2">₹{p.price}</p>
              <div className="flex gap-2 mt-4">
                <Link href={`/product/${p._id}`} className="w-full">
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                    More Details
                  </button>
                </Link>
                <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
