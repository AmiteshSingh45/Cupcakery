"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/Context/auth";
import { useRouter } from "next/navigation";
import useCategory from "@/hooks/useCategory";
import { useCart } from "@/Context/cart";

const Navbar = () => {
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const collectionsRef = useRef(null);
  const ordersRef = useRef(null);
  const userMenuRef = useRef(null);
  
  const categories = useCategory();
  const [auth, login, logout] = useAuth();
  const router = useRouter();
  const { cart } = useCart();
  const cartCount = cart.length;

  useEffect(() => {
    setIsAuthenticated(!!auth?.user);
  }, [auth]);

  const handleLogout = () => {
    logout();
    router.push("/Login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (collectionsRef.current && !collectionsRef.current.contains(event.target)) {
        setCollectionsOpen(false);
      }
      if (ordersRef.current && !ordersRef.current.contains(event.target)) {
        setOrdersOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white text-black shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 h-20 relative">
        
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Bindi's Cupcakery" width={200} height={20} className="rounded-full" />
        </Link>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-xs mx-4">
          <input
            type="text"
            placeholder="Search"
            className="px-4 py-2 pr-10 text-black border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 w-full"
          />
          <img 
            src="/search.png" 
            alt="Search Icon" 
            className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2"
          />
        </div>

        {/* Right Side: Hamburger Menu (Mobile) */}
        <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)}>☰</button>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-6">
          <li className="relative" ref={collectionsRef}>
            <span onClick={() => setCollectionsOpen(!collectionsOpen)} className="cursor-pointer hover:text-purple-500">
              All Collections ▼
            </span>
            {collectionsOpen && (
              <ul className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 grid grid-cols-2 gap-2 p-2 border border-gray-200">
                {categories.map((c) => (
                  <li key={c.slug} className="px-4 py-2 hover:bg-gray-100 transition-all">
                    <Link href={`/category/${c.slug}`}>{c.name}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li><Link href="/About_Us" className="hover:text-purple-500">About Us</Link></li>
          <li><Link href="/Contact_Us" className="hover:text-purple-500">Contact Us</Link></li>
          <li>
            <Link href="/cart" className="relative flex items-center">
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
          {!isAuthenticated ? (
            <>
              <li><Link href="/Register" className="bg-purple-500 text-white px-5 py-2 rounded-lg hover:bg-purple-600 transition-all">Register</Link></li>
              <li><Link href="/Login" className="bg-purple-500 text-white px-5 py-2 rounded-lg hover:bg-purple-600 transition-all">Login</Link></li>
            </>
          ) : (
            <li className="relative" ref={userMenuRef}>
              <span onClick={() => setUserMenuOpen(!userMenuOpen)} className="cursor-pointer hover:text-purple-500">
                {auth?.user?.name} ▼
              </span>
              {userMenuOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <li className="px-4 py-2 hover:bg-gray-100">
                    <Link href={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`}>Dashboard</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100">
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;