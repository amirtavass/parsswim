"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MdMenu, MdClose } from "react-icons/md";
import NavBarSkeleton from "./NavBarSkeleton";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import CartIcon from "./CartIcon";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Cart */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.jpg"
                alt="parsswim"
                width={200}
                height={90}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <Suspense fallback={<div className="w-6 h-6" />}>
              <CartIcon pathname={pathname} />
            </Suspense>
          </div>

          {/* Desktop Menu */}
          <Suspense fallback={<NavBarSkeleton />}>
            <DesktopMenu pathname={pathname} />
          </Suspense>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              {isMenuOpen ? (
                <MdClose className="w-6 h-6" />
              ) : (
                <MdMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <Suspense
            fallback={<div className="h-32 bg-gray-50 animate-pulse" />}
          >
            <MobileMenu pathname={pathname} onClose={closeMenu} />
          </Suspense>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
