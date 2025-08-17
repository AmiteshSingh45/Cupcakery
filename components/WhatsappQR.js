"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const WhatsAppQR = () => {
  const [isQRVisible, setIsQRVisible] = useState(false); // Track QR visibility
  const qrRef = useRef(null); // Reference for QR code container
  const buttonRef = useRef(null); // Reference for the button

  const whatsappNumber = "918340497237"; // Your WhatsApp number
  const message = "Hello, I want to place an order!"; // The message to pre-fill
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(whatsappLink)}&size=150`; // Reduced size

  const toggleQR = () => {
    setIsQRVisible(!isQRVisible); // Toggle the QR code visibility
  };

  // Hide the QR code if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        qrRef.current && !qrRef.current.contains(event.target) && 
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setIsQRVisible(false); // Hide the QR code
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Clean up the event listener
    };
  }, []);

  return (
    <>
      {/* Side menu button */}
      <div
        ref={buttonRef}
        onClick={toggleQR}
        className="fixed bottom-10 right-10 bg-green-500 text-white p-4 rounded-full cursor-pointer shadow-lg"
      >
        <span className="text-sm">Order via WhatsApp</span>
      </div>

      {/* QR Code - toggle visibility */}
      {isQRVisible && (
        <div
          ref={qrRef}
          className="fixed bottom-10 right-10 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
        >
          <h2 className="text-lg font-bold mb-2 text-gray-800">Order via WhatsApp</h2>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Image
  src={qrCodeUrl}
  alt="WhatsApp QR Code"
  width={150}
  height={150}
 />
            
          </a>
          <p className="text-sm text-gray-600 mt-2">Scan to order instantly!</p>
        </div>
      )}
    </>
  );
};

export default WhatsAppQR;
