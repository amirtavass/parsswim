"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/app/lib/queryClient";
import NavBar from "@/app/components/layout/NavBar";
import "@/app/_styles/globals.css";
import { Vazirmatn, Poppins } from "next/font/google";
import Footer from "./components/layout/Footer";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/authContext";
import { CartProvider } from "./contexts/CartContext";
import { AdminProvider } from "./contexts/AdminContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-vazirmatn",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${vazirmatn.variable} ${poppins.variable}`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${poppins.className}`}>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <LanguageProvider>
              <AuthProvider>
                <AdminProvider>
                  <CartProvider>
                    <ThemeProvider>
                      <NavBar />
                      <main>{children}</main>
                      <Footer />
                    </ThemeProvider>
                  </CartProvider>
                </AdminProvider>
              </AuthProvider>
            </LanguageProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
