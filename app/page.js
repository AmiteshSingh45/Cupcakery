"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import ReviewForm from "../components/reveiwForm";
import ReviewSlider from "../components/Reveiwslider";
import WhatsAppQR  from "../components/WhatsappQR"

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = ["/hpcakefinal.jfif", "/hp_img2.jpg", "/hp_img3.jpg", "/Rose Pistachio Cranberry Truffle.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white text-gray-900">
 {/* Floating WhatsApp QR */}
<div className="fixed bottom-6 right-6 bg-white p-3 rounded-full shadow-lg z-50">
  <WhatsAppQR />
</div>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center text-center h-[85vh] w-full">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={images[selectedImage]}
            alt="Bindi's Cupcakery Special"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Overlay Content */}
        <div className="relative z-10 bg-white bg-opacity-80 backdrop-blur-lg px-10 py-12 rounded-2xl shadow-xl max-w-3xl text-center border border-pink-300">
    <h1 className="text-5xl md:text-6xl font-extrabold text-green-700 font-[Playfair Display] drop-shadow-md">
      Welcome to Bindi’s Cupcakery 🍰
    </h1>
    <p className="mt-4 text-lg text-gray-800 font-medium">
      100% Eggless, Homemade & Preservative-Free Desserts in Surat!
    </p>
    <Link href="/products">
      <button className="mt-6 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-rose-400 hover:to-pink-500 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
        Order Now
      </button>
    </Link>
  </div>
      </section>

    {/* Feature Highlights Section */}
<section className="py-16 bg-gradient-to-b from-pink-50 to-white">
  <div className="container mx-auto px-6 text-center">
    <h2 className="sechead">Why Choose Bindi’s Cupcakery?</h2><br />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {[
        {
          title: "100% Vegetarian & Preservative-Free",
          description: "Enjoy homemade treats made with natural ingredients, completely eggless and free from preservatives.",
          img: "/cake.png", 
        },
        {
          title: "Wide Range of Desserts",
          description: "From ice creams to cupcakes, brownies, and cakes, we offer a variety of delicious options for every craving.",
          img: "/sweets.png", 
        },
        {
          title: "Customizable Hampers",
          description: "Personalize dessert hampers for birthdays, weddings, and special occasions.",
          img: "/hamper.png", 
        },
        {
          title: "Seamless Ordering",
          description: "Scan our WhatsApp QR code to place an order instantly and enjoy quick pickups from our cloud kitchen.",
          img: "/order.png", 
        },
       
      ].map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105"
        >
          <div className="w-16 h-16 mb-4">
            <Image
              src={item.img}
              alt={item.title}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
          <p className="text-sm text-gray-600 mt-2">{item.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>



   {/* Our Products Section */}
<section className="py-16 px-6 text-center bg-gradient-to-b from-gray-50 to-gray-100">
  <h2 className="sechead">Our Products 🍪</h2>
  <p className="mt-2 text-gray-700 text-lg">Indulge in our delicious range of sweet treats.</p>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-10">
    {[
      { name: "Cakes", img: "/hpcakeproduct.jpeg", link: "/category/cakes" },
      { name: "Brownies", img: "/hpbrowniesproduct.jfif", link: "/category/brownies" },
      { name: "Cookies", img: "/hpcookiesproduct1.jfif", link: "/category/cookies" },
      { name: "Truffle", img: "/hptruffleproduct.jfif", link: "/category/truffle" },
    ].map((item, index) => (
      <Link key={index} href={item.link} className="group relative block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
        <Image
          src={item.img}
          alt={item.name}
          width={300}
          height={220}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-2xl font-semibold text-white">{item.name}</span>
        </div>
      </Link>
    ))}
  </div>

  <Link href="/products">
    <button className="mt-10 px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-full text-lg shadow-md hover:shadow-lg transition-all">
      View More
    </button>
  </Link>
</section>


    {/* Best Sellers */}
<section className="py-16 px-6 text-center bg-gradient-to-b from-white to-gray-50">
  <h2 className="sechead">Best Sellers</h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mt-10">
    {[
      { name: "Dark Chocolate Hazelnut Brownie", price: "₹219", img: "/brownie_best.jpg" },
      { name: "Rose Pistachio Cranberry Truffle", price: "₹169", img: "/trufflebest.jpg" },
      { name: "Choco Dip Cookies 🍪🍫", price: "₹199", img: "/chocodipcookiesbest.jpg" },
    ].map((item, index) => (
      <div 
        key={index} 
        className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 transform transition duration-300 hover:shadow-lg hover:scale-105"
      >
        <Image
          src={item.img}
          alt={item.name}
          width={300}
          height={220}
          className="w-full h-56 object-cover"
        />
        <div className="p-5 text-center">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <p className="text-pink-600 font-bold text-lg">{item.price}</p>
        </div>
      </div>
    ))}
  </div>
</section>


      {/* Call to Action */}
      <section className="py-16 bg-red-500 text-center text-white">
        <h2 className="text-4xl font-bold">Craving Something Sweet?</h2>
        <p className="mt-2 text-lg">Order now and satisfy your taste buds! 🍰</p>
        <Link href="/products"><br />
        <button type="button" className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Explore Menu</button>

        </Link>
      </section>

    {/* ⭐ Review Form Section - Before Testimonials */}
<section className="px-6 py-12 bg-pink-100 rounded-lg shadow-md">
  <h2 className="text-3xl font-bold text-center text-pink-600">
    Share Your Experience 💬
  </h2>
  <p className="text-center text-gray-700 mt-2">
    We value your feedback! Leave a review below.
  </p>

  <div className="bg-white p-6 rounded-lg shadow-md mt-6">
    <ReviewForm /> {/* ✅ Users can submit reviews here */}
  </div>

  {/* ⭐ Testimonial Slider with subtle background and padding */}
  <div className="mt-10 p-6 bg-white rounded-lg shadow-md">
    <ReviewSlider />
  </div>
</section>



    </div>
  );
}
