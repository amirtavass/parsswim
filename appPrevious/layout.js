"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/app/lib/queryClient";
import NavBar from "@/app/components/layout/NavBar";
import "@/app/_styles/globals.css";
import { Vazirmatn } from "next/font/google";
import Footer from "./components/layout/Footer";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/authContext";
import { CartProvider } from "./contexts/CartContext";
import { AdminProvider } from "./contexts/AdminContext";
import { LanguageProvider } from "./contexts/LanguageContext";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-vazirmatn",
});

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} `}>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={vazirmatn.className}>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <AuthProvider>
              <AdminProvider>
                <CartProvider>
                  <ThemeProvider>
                    <NavBar />
                    {children}
                    <Footer />
                  </ThemeProvider>
                </CartProvider>
              </AdminProvider>
            </AuthProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
