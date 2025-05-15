"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../../Context/cart";
import { useAuth } from "../../Context/auth";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa"; // Import the trash icon

const CartPage = () => {
  const paymentHandler = async (e, amount) => {
    e.preventDefault();
    const receiptId = "qwsaq1";
    console.log("amount = ", amount);

    try {
      const response = await fetch("http://localhost:4000/api/v1/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
          receipt: receiptId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const textResponse = await response.text();
        throw new Error(`Server Error: ${response.status} - ${textResponse}`);
      }

      const order = await response.json();
      console.log("Order Created: ", order);

      var options = {
        key: "rzp_test_mZGFuX4QG8UG7y",
        amount: amount * 100,
        currency: "INR",
        name: "Acme Corp",
        description: "Test Transaction",
        order_id: order.id,
        handler: async function (response) {
          console.log("Payment Successful: ", response);

          const orderDetails = {
            userId: "67ae3b5bb1e1642a2f53011c",
            payStatus: "paid",
            orderId: order.id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            amount: amount,
            orderItems: cartArray,
            userShipping: auth.user,
            orderDate: new Date().toISOString(),
          };

          const saveOrderRes = await fetch("http://localhost:4000/api/v1/payment/verify-payment", {
            method: "POST",
            body: JSON.stringify(orderDetails),
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!saveOrderRes.ok) {
            const errorText = await saveOrderRes.text();
            throw new Error(`Order Save Error: ${saveOrderRes.status} - ${errorText}`);
          }

          const saveOrderJson = await saveOrderRes.json();
          console.log("Order Saved Successfully: ", saveOrderJson);
          alert("Payment Successful and Order Saved!");
        },
        prefill: {
          name: "Web Dev Matrix",
          email: "webdevmatrix@example.com",
          contact: "9000000000",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      var rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp1.open();
    } catch (error) {
      console.error("Error in payment processing: ", error.message);
      alert("Error processing payment. Please try again.");
    }
  };

  const [auth] = useAuth();
  const { cart, setCart } = useCart();
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const cartArray = Array.isArray(cart) ? cart : [];

  const totalPrice = () => {
    return cartArray.reduce((total, item) => total + item.price, 0);
  };

  // Function to remove an item from the cart
  const removeItem = (productId) => {
    const updatedCart = cartArray.filter((item) => item._id !== productId);
    setCart(updatedCart);
  };

  useEffect(() => {
    setIsCartLoaded(cartArray.length > 0);
  }, [cartArray]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-center text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
          {auth?.user ? `Hello, ${auth.user.name}!` : "Hello, Guest!"}
        </h1>
        <p className="text-center text-lg text-gray-600">
          {cartArray.length
            ? `You have ${cartArray.length} items in your cart`
            : "Your cart is empty."}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            {isCartLoaded ? (
              cartArray.map((p, index) => (
                <div
                  key={`${p._id}-${index}`}
                  className="bg-white shadow-sm rounded-lg p-6 flex gap-6 mb-4 hover:shadow-md transition-shadow duration-200 border border-gray-100"
                >
                  <img
                    src={`http://localhost:4000/api/v1/product/product-photo/${p._id}`}
                    alt={p.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-md border border-gray-200"
                  />
                  <div className="flex-1">
                    <h5 className="text-xl font-semibold text-gray-800">{p.name}</h5>
                    <p className="text-gray-600 text-sm mt-1">{p.description.substring(0, 50)}...</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">₹{p.price}</p>
                  </div>
                  
                  <button
                    onClick={() => removeItem(p._id)}
                    className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    <FaTrash className="mr-2" /> Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-xl text-gray-500">Your cart is currently empty.</p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold transition-all duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Cart Summary</h2>
            <hr className="my-4 border-gray-200" />
            <h4 className="text-lg font-medium text-gray-700">Total Amount: ₹{totalPrice()}</h4>
            {auth?.token ? (
              <button
                className="w-full py-3 mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={(e) => paymentHandler(e, totalPrice())}
                disabled={cartArray.length === 0}
              >
                Proceed to Payment
              </button>
            ) : (
              <button
                className="w-full py-3 mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => router.push("/Login")}
              >
                Login First
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;