import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/Context/auth"; // Import AuthProvider
import { CartProvider } from "@/Context/cart"; // Import CartProvider
import { SearchProvider } from "../Context/search"; 

// Load custom fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Metadata for the website
export const metadata = {
  title: "Bindi's Cupcakery",
  description:
    "Bindi’s Cupcakery is a vegetarian, eggless bakery offering a wide variety of homemade, preservative-free desserts such as cupcakes, brownies, cakes, and ice creams",
  openGraph: {
    title: "Bindi's Cupcakery",
    description:
      "Bindi’s Cupcakery is a vegetarian, eggless bakery offering a wide variety of homemade, preservative-free desserts.",
    image: "/path-to-image.jpg", // Optional
    url: "https://www.bindiscupcakery.com", // Replace with your URL
  },
  twitter: {
    card: "summary_large_image",
    title: "Bindi's Cupcakery",
    description:
      "Bindi’s Cupcakery is a vegetarian, eggless bakery offering a wide variety of homemade, preservative-free desserts.",
    image: "/path-to-image.jpg", // Optional
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Wrap with AuthProvider for authentication context */}
        <AuthProvider>
          {/* Wrap with CartProvider for cart context */}
          <CartProvider>
          <SearchProvider>
            <Navbar />
            <Toaster position="top-right" /> {/* Added Toaster here */}
            <main className="min-h-[82vh]">
              <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
              {children}
            </main>
            <Footer />
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
