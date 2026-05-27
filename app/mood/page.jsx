"use client";
import { useState } from "react";
import { BACKEND } from "@/lib/api";

export default function MoodPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleMood = async (inputData) => {
    setLoading(true);

    const moodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/predict-mood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputData)
    });

    const moodData = await moodRes.json();
    const mood = moodData.mood;

    const productRes = await fetch(`${BACKEND}/api/recommend/${mood}`);
    const productsData = await productRes.json();

    setResult({ mood, products: productsData.products });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 py-10">

      {/* TITLE */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
          🍰 Mood Based Cupcake Recommendation
        </h1>
        <p className="text-gray-600 mt-2">
          Select how you feel and we’ll surprise you with the best treats ✨
        </p>
      </div>

      {/* MOOD BUTTONS */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        
        <button 
          onClick={() => handleMood({ flavor_type:"fruity", sweetness_level:2, richiness:2, fruity:1, nutty:0, price:199 })}
          className="px-6 py-3 rounded-full bg-pink-100 hover:bg-pink-300 transition shadow-sm border text-black"
        >
          😍 Happy
        </button>

        <button 
          onClick={() => handleMood({ flavor_type:"chocolate", sweetness_level:3, richiness:3, fruity:0, nutty:0, price:229 })}
          className="px-6 py-3 rounded-full bg-purple-100 hover:bg-purple-300 transition shadow-sm border text-black"
        >
          🤍 Comfort
        </button>

        <button 
          onClick={() => handleMood({ flavor_type:"light", sweetness_level:1, richiness:1, fruity:0, nutty:0, price:120 })}
          className="px-6 py-3 rounded-full bg-blue-100 hover:bg-blue-300 transition shadow-sm border text-black"
        >
          😌 Calm
        </button>

        <button 
          onClick={() => handleMood({ flavor_type:"sweet", sweetness_level:3, richiness:2, fruity:1, nutty:1, price:180 })}
          className="px-6 py-3 rounded-full bg-yellow-100 hover:bg-yellow-300 transition shadow-sm border text-black"
        >
          🤩 Excited
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <h3 className="text-center text-lg text-purple-600 font-semibold">
          ⏳ Finding your perfect cupcake...
        </h3>
      )}

      {/* RESULT */}
      {result && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-center mb-4">
            🎯 Detected Mood: <span className="text-purple-600">{result.mood}</span>
          </h2>

          <h3 className="text-lg text-center mb-6 text-gray-700">
            Recommended Cupcakes for You 🍩
          </h3>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.products.map((p) => (
              <div 
                key={p._id}
                className="border rounded-xl p-5 shadow-sm hover:shadow-lg transition bg-gradient-to-b from-white to-purple-50"
              >
                <h4 className="text-xl font-extrabold text-black mb-2 leading-snug">
                    {p.name}
                    </h4>

                <p className="text-purple-700 font-semibold mb-1">₹{p.price}</p>
                {p.description && (
                  <p className="text-gray-600 text-sm">
                    {p.description.slice(0, 70)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
