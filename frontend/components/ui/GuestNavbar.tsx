"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TrendingUp, Menu, X, LayoutDashboard, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export const GuestNavbar = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "About Us", href: "/about" },
    { name: "Markets", href: "/market" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6
        ${isScrolled ? "py-4 bg-bg-dark/80 backdrop-blur-md border-b border-white/5" : "py-8 bg-transparent"}
      `}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
              <img src="/images/boyztrade-logo.jpg" alt="BoyzTrade" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Boyz<span className="text-success">Trade</span></span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-sm font-bold transition-all hover:text-success relative group ${
                  pathname === link.href ? "text-success" : "text-muted-foreground"
                }`}
              >
                {link.name}
                {pathname === link.href && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-success rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <UserIcon className="w-4 h-4 text-success" />
                  <span>{user.displayName || user.email?.split('@')[0] || "Trader"}</span>
                </div>
                <Link href="/dashboard">
                  <Button className="px-6 py-2 text-sm flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="secondary" className="text-sm">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="px-6 py-2 text-sm">Join Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-foreground relative z-[75]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer - Moved outside nav element to prevent style inheritance */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-[100] md:hidden"
            />

            {/* Right Side Drawer - Completely isolated from navbar styles */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] z-[101] md:hidden"
              style={{
                backgroundColor: '#050505',
                boxShadow: '-5px 0 25px rgba(0,0,0,0.5)'
              }}
            >
              <div className="h-full w-full flex flex-col overflow-y-auto" style={{ backgroundColor: '#050505' }}>
                {/* Header with close button */}
                <div className="flex items-center justify-end p-6 sticky top-0 bg-[#050505] z-10">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-6 px-8 flex-1">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-2xl font-bold transition-all py-2 ${
                        pathname === link.href 
                          ? "text-success border-l-4 border-success pl-4" 
                          : "text-white hover:text-success pl-4 hover:border-l-4 hover:border-success"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 p-8 pt-6 border-t border-white/10 mt-auto">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 mb-2">
                        <UserIcon className="w-5 h-5 text-success" />
                        <span className="text-base font-semibold text-gray-300">
                          {user.displayName || user.email?.split('@')[0] || "Trader"}
                        </span>
                      </div>
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full text-base py-6 rounded-xl shadow-lg shadow-success/20 flex items-center justify-center gap-2">
                          <LayoutDashboard className="w-5 h-5" />
                          Go to Dashboard
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="secondary" className="w-full text-base py-3 rounded-xl">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full text-base py-3 rounded-xl shadow-lg shadow-success/20">
                          Join Now
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};