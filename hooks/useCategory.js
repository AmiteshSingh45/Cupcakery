"use client"; // Ensures this runs only in the client

import { useState, useEffect } from "react";
import axios from "axios";

export default function useCategory() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        if (typeof window !== "undefined") { // Prevent SSR execution
          const { data } = await axios.get(
            `https://cupcakery-backend.onrender.com/api/v1/category/get-category`
          );
          // Ensure data.category is an array before setting state
          if (Array.isArray(data?.category)) {
            setCategories(data.category);
          } else {
            setCategories([]); // Fallback to an empty array
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]); // Fallback in case of an error
      }
    };

    getCategories();
  }, []);

  return categories;
}
