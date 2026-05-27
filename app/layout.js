import { Playfair_Display, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/Context/auth";
import { CartProvider } from "@/Context/cart";
import { SearchProvider } from "../Context/search";
import ScrollProgress from "@/components/ScrollProgress";

// ── Google Fonts ────────────────────────────────────────────────────────────
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// ── Local Fonts (kept for backward compat) ───────────────────────────────────
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// ── Metadata ────────────────────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL("https://www.bindiscupcakery.com"),
  title: {
    default: "Bindi's Cupcakery — Handcrafted Desserts in Surat",
    template: "%s | Bindi's Cupcakery",
  },
  description:
    "Bindi's Cupcakery crafts 100% eggless, preservative-free, homemade desserts — cupcakes, brownies, cakes, cookies, and ice creams — made with love in Surat, Gujarat.",
  keywords: ["cupcakery", "eggless bakery", "surat", "homemade desserts", "cupcakes", "brownies", "cakes"],
  authors: [{ name: "Bindi's Cupcakery" }],
  creator: "Bindi's Cupcakery",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.bindiscupcakery.com",
    title: "Bindi's Cupcakery — Handcrafted Desserts in Surat",
    description:
      "100% eggless, preservative-free homemade desserts. Cupcakes, brownies, cakes & more.",
    siteName: "Bindi's Cupcakery",
    images: [{ url: "/hpcakefinal.jpg", width: 1200, height: 630, alt: "Bindi's Cupcakery" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bindi's Cupcakery",
    description: "100% eggless, preservative-free homemade desserts in Surat.",
    images: ["/hpcakefinal.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable} ${geistMono.variable}`}
    >
      <body className="font-body antialiased bg-cream text-espresso-900 overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              {/* Scroll progress indicator */}
              <ScrollProgress />

              {/* Premium sticky navbar */}
              <Navbar />

              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#FDF6EC",
                    color: "#1a0a00",
                    fontFamily: "var(--font-dm-sans)",
                    border: "1px solid #F0CC82",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(26,10,0,0.12)",
                  },
                  success: {
                    iconTheme: { primary: "#D4A853", secondary: "#FDF6EC" },
                  },
                  error: {
                    iconTheme: { primary: "#D4607A", secondary: "#FDF6EC" },
                  },
                }}
              />

              {/* Main content */}
              <main className="min-h-[82vh]">{children}</main>

              <Footer />
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
