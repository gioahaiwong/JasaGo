import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../axiosConfig";
import CustomerServiceToast from "./customerService";
import { Wrench, LogOut, Headphones, Menu, X } from "lucide-react";

type User = {
  id: number;
  name: string;
  role: "client" | "provider" | "admin";
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [csOpen, setCsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const csButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error("Failed to parse user");
      }
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogOut = async () => {
    try {
      await api.post("/api/users/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("user");
    window.location.replace("/login");
  };

  return (
    <>
      {/* Navbar Premium */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100"
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              JasaGo
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/home"
              className="text-white hover:text-purple-600 font-medium transition"
            >
              Home
            </Link>
            {user?.role === "client" && (
              <>
                <Link
                  to="/services"
                  className="text-white hover:text-purple-600 font-medium transition"
                >
                  Services
                </Link>
                <Link
                  to="/my-orders"
                  className="text-white hover:text-purple-600 font-medium transition"
                >
                  My Orders
                </Link>
              </>
            )}

            {user?.role === "provider" && (
              <>
                <Link
                  to="/my-services"
                  className="text-white hover:text-purple-600 font-medium transition"
                >
                  My Services
                </Link>
                <Link
                  to="/incoming-orders"
                  className="text-white hover:text-purple-600 font-medium transition"
                >
                  Orders
                </Link>
                <Link
                  to="/providers-review"
                  className="text-white hover:text-purple-600 font-medium transition"
                >
                  Reviews
                </Link>
              </>
            )}

            <Link
              to="/profile"
              className="text-white hover:text-purple-600 font-medium transition"
            >
              Profile
            </Link>
            <Link
              to="/about-us"
              className="text-white hover:text-purple-600 font-medium transition"
            >
              About Us
            </Link>
            <button
              ref={csButtonRef}
              onClick={() => setCsOpen(true)}
              className="flex items-center gap-2 text-white hover:text-purple-600 font-medium transition"
            >
              <Headphones className="w-4 h-4" />
              Customer Service
            </button>
            <button
              onClick={handleLogOut}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setCsOpen(true)}
              className="bg-white/10 text-white p-2 rounded-lg"
              aria-label="Customer Service"
            >
              <Headphones className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="bg-white/10 text-white p-2 rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ==================== MOBILE DRAWER ==================== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[82%] max-w-sm bg-gray-900 z-[70] md:hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    JasaGo
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="px-5 py-4 border-b border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Signed in as
                  </p>
                  <p className="text-white font-semibold mt-1 truncate">
                    {user.name}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wide font-medium bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
              )}

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <MobileNavItem
                  to="/home"
                  label="Home"
                  onClick={() => setMobileOpen(false)}
                />

                {user?.role === "client" && (
                  <>
                    <MobileNavItem
                      to="/services"
                      label="Services"
                      onClick={() => setMobileOpen(false)}
                    />
                    <MobileNavItem
                      to="/my-orders"
                      label="My Orders"
                      onClick={() => setMobileOpen(false)}
                    />
                  </>
                )}

                {user?.role === "provider" && (
                  <>
                    <MobileNavItem
                      to="/my-services"
                      label="My Services"
                      onClick={() => setMobileOpen(false)}
                    />
                    <MobileNavItem
                      to="/incoming-orders"
                      label="Orders"
                      onClick={() => setMobileOpen(false)}
                    />
                    <MobileNavItem
                      to="/providers-review"
                      label="Reviews"
                      onClick={() => setMobileOpen(false)}
                    />
                  </>
                )}

                <MobileNavItem
                  to="/profile"
                  label="Profile"
                  onClick={() => setMobileOpen(false)}
                />
                <MobileNavItem
                  to="/about-us"
                  label="About Us"
                  onClick={() => setMobileOpen(false)}
                />

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setCsOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition text-left"
                >
                  <Headphones className="w-4 h-4" />
                  <span className="font-medium">Customer Service</span>
                </button>
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-gray-800">
                <button
                  onClick={handleLogOut}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/15 text-red-400 hover:bg-red-500/25 py-3 rounded-xl font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==================== CUSTOMER SERVICE TOAST ==================== */}
      <CustomerServiceToast
        isOpen={csOpen}
        onClose={() => setCsOpen(false)}
        anchorRef={csButtonRef}
      />
    </>
  );
}

function MobileNavItem({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition text-left"
    >
      <span className="font-medium">{label}</span>
    </Link>
  );
}
