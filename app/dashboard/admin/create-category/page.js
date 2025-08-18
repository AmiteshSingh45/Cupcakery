"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import CategoryForm from "../../../form/category/page";
import AdminMenu from "../../../../components/Adminmenu";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [token, setToken] = useState(null);

  // Get token from localStorage safely on client
  useEffect(() => {
    const auth = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth")) : null;
    setToken(auth?.token || null);
  }, []);

  // Handle Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      return toast.error("Authentication failed. Please log in.");
    }

    try {
      const { data } = await axios.post(
        "https://cupcakery-backend.onrender.com/api/v1/category/create-category",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(`${name} is created`);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong while creating category.");
    }
  };

  // Get all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(
        "https://cupcakery-backend.onrender.com/api/v1/category/get-category"
      );
      if (data.success) {
        setCategories(data.category);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching categories.");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // Update category
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Authentication failed. Please log in.");

    try {
      const { data } = await axios.put(
        `https://cupcakery-backend.onrender.com/api/v1/category/update-category/${selected._id}`,
        { name: updatedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(`${updatedName} is updated`);
        setSelected(null);
        setUpdatedName("");
        setVisible(false);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong while updating category.");
    }
  };

  // Delete category
  const handleDelete = async (pId) => {
    if (!token) return toast.error("Authentication failed. Please log in.");

    try {
      const { data } = await axios.delete(
        `https://cupcakery-backend.onrender.com/api/v1/category/delete-category/${pId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Category is deleted");
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong while deleting category.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <div className="flex">
        <div className="w-1/4 p-6 bg-gray-100 min-h-screen shadow-md">
          <AdminMenu />
        </div>
        <div className="w-3/4">
          <h1 className="text-2xl text-black font-semibold mb-4">Manage Category</h1>
          <div className="p-4 w-1/2">
            <CategoryForm handleSubmit={handleSubmit} value={name} setValue={setName} />
          </div>
          <div className="w-full mt-4">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((c) => (
                  <tr key={c._id}>
                    <td className="px-4 py-2 border-b">{c.name}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        onClick={() => {
                          setVisible(true);
                          setUpdatedName(c.name);
                          setSelected(c);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 ml-2"
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visible && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2 text-white">Update Category</h2>
              <form onSubmit={handleUpdate}>
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  placeholder="Update category name"
                  className="border p-2 rounded-md w-full bg-gray-700 text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Update
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
