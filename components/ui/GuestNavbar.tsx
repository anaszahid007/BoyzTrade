"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TrendingUp, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/Button";

export const GuestNavbar = () => {
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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Markets", href: "/market" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6
      ${isScrolled ? "py-4 bg-bg-dark/80 backdrop-blur-md border-b border-white/5" : "py-8 bg-transparent"}
    `}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-success/10 rounded-xl border border-success/20 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 text-success" />
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
          <Link href="/auth/login">
            <Button variant="secondary" className="text-sm">Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button className="px-6 py-2 text-sm">Join Now</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Right Side Drawer */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-bg-dark border-l border-white/5 z-[70] p-10 flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-3">
                  {/* <div className="p-2 bg-success/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <span className="text-xl font-bold">BoyzTrade</span> */}
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-8 flex-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-2xl font-bold transition-all ${
                      pathname === link.href ? "text-success" : "text-muted-foreground hover:text-success"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-6 pt-10 border-t border-white/5">
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full text-lg py-7 rounded-2xl">Sign In</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full text-lg py-7 rounded-2xl shadow-lg shadow-success/10">Join Now</Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
