import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 py-10 px-6 md:px-16 relative">
      {/* Top Divider Line */}
      <div className="w-full border-t border-gray-300 mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-center md:text-left">
        
        {/* Column 1: Branding & Description */}
        <div>
          <Link href="/"><h2 className="text-2xl font-bold text-purple-600">Bindi's Cupcakery 🍰</h2></Link>
          <p className="text-sm mt-2 text-gray-600">
  Homemade, eggless, and preservative-free desserts made with love in Surat.
</p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-indigo-600">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Link href="/Cupcakes" className="text-gray-700 hover:text-purple-600 transition">Cupcakes</Link>
            <Link href="/Brownies" className="text-gray-700 hover:text-purple-600 transition">Brownies</Link>
            <Link href="/Cakes" className="text-gray-700 hover:text-purple-600 transition">Cakes</Link>
            <Link href="/Pastries" className="text-gray-700 hover:text-purple-600 transition">Pastries</Link>
            <Link href="/Cookies" className="text-gray-700 hover:text-purple-600 transition">Cookies</Link>
            <Link href="/Icecreams" className="text-gray-700 hover:text-purple-600 transition">Ice Creams</Link>
            <Link href="/About_Us" className="text-gray-700 hover:text-purple-600 transition">About Us</Link>
            <Link href="/Contact_Us" className="text-gray-700 hover:text-purple-600 transition">Contact Us</Link>
            <Link href="/" className="text-gray-700 hover:text-purple-600 transition">Terms of Service</Link>
            <Link href="/" className="text-gray-700 hover:text-purple-600 transition">Privacy Policy</Link>
          </div>
        </div>

        {/* Column 3: Social Media */}
        <div className="flex flex-col items-center md:items-end">
          <h3 className="text-lg font-semibold text-blue-600">Stay Connected</h3>
          <div className="flex gap-3 mt-3">
            <Link href="https://www.instagram.com/bindis_cupcakery" target="_blank">
              <button className="bg-gradient-to-r from-pink-400 to-orange-400 text-white px-4 py-2 rounded-full flex items-center gap-2 transition hover:scale-105">
                📸 Instagram
              </button>
            </Link>
            <Link href="https://www.facebook.com/bindi.malji" target="_blank">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 transition hover:scale-105">
                👍 Facebook
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="text-center border-t border-gray-300 mt-8 pt-4 text-sm text-gray-600">
        <p>Copyright &copy; {new Date().getFullYear()} Bindi&apos;s Cupcakery - All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
