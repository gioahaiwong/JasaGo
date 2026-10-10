import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../axiosConfig";
import CustomerServiceToast from "./customerService";
import {
  Wrench,
  Zap,
  Droplet,
  Sparkles,
  Paintbrush,
  Truck,
  ArrowRight,
  Star,
  Shield,
  Clock,
  User,
  LogOut,
  Headphones,
  Menu,
  X,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  role: "client" | "provider" | "admin";
};

// Data kategori
const categories = [
  {
    name: "Electrician",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-600",
  },
  {
    name: "Plumbing",
    icon: Droplet,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    name: "Cleaning",
    icon: Sparkles,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    name: "Carpentry",
    icon: Wrench,
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
  },
  {
    name: "Painting",
    icon: Paintbrush,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-100",
    textColor: "text-pink-600",
  },
  {
    name: "Moving",
    icon: Truck,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
];

// Statistik
const stats = [
  { value: "500+", label: "Active Services", icon: Star },
  { value: "200+", label: "Expert Providers", icon: Shield },
  { value: "24/7", label: "Customer Support", icon: Clock },
  { value: "10k+", label: "Happy Clients", icon: User },
];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [csOpen, setCsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const csButtonRef = useRef<HTMLButtonElement>(null);

  const firstName = user?.name?.split(" ")[0] || "User";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
      } catch {
        window.location.replace("/login");
      }
    } else {
      window.location.replace("/login");
    }
  }, []);

  useEffect(() => {
    if (user?.role === "client") {
      const fetchRecommendations = async () => {
        setLoadingRecs(true);
        try {
          const res = await api.get("/api/services/recommendations");
          setRecommendations(res.data);
        } catch (err) {
          console.error("Failed to fetch recommendations:", err);
        } finally {
          setLoadingRecs(false);
        }
      };
      fetchRecommendations();
    }
  }, [user]);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-900 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white mt-4 text-lg"
        >
          Loading your dashboard...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
              ref={csButtonRef}
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

      {/* Hero Section Premium */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-300 text-white py-12 sm:py-16 md:py-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/10 rounded-full"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                x: [0, (Math.random() - 0.5) * 50, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                {firstName} !
              </span>
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Find trusted professional services at your fingertips
            </p>
            {user?.role === "provider" && (
              <Link
                to="/create-service"
                className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Add Services
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition" />
              </Link>
            )}
            {user?.role === "client" && (
              <Link
                to="/services"
                className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Explore Services
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-200 ">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                </div>
                <div className="text-xl md:text-3xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* ==================== PROVIDER QUICK ACTIONS ==================== */}
      {user?.role === "provider" && (
        <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            {/* Greeting banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-3xl p-6 md:p-10 mb-8 md:mb-10 shadow-xl"
            >
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-purple-200 text-xs md:text-sm font-medium uppercase tracking-wide mb-1">
                    Provider Dashboard
                  </p>
                  <h2 className="text-white text-2xl md:text-3xl font-bold">
                    What's Up, {firstName}! 👋
                  </h2>
                  <p className="text-purple-100 text-sm md:text-base mt-1.5 max-w-xl">
                    Manage your services, check incoming orders, and grow your
                    business!
                  </p>
                </div>

                <Link
                  to="/create-service"
                  className="inline-flex items-center gap-2 bg-white text-purple-700 px-5 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm md:text-base whitespace-nowrap self-start md:self-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  Add New Service
                </Link>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <Link
                  to="/my-services"
                  className="group block bg-white rounded-2xl p-5 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 h-full"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Wrench className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">
                    My Services
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">
                    View, edit, or remove your listed services.
                  </p>
                  <span className="inline-flex items-center gap-1 text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
                    Manage <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <Link
                  to="/incoming-orders"
                  className="group block bg-white rounded-2xl p-5 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 h-full"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">
                    Incoming Orders
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">
                    Accept, complete, and track your orders.
                  </p>
                  <span className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                    View orders <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <Link
                  to="/providers-review"
                  className="group block bg-white rounded-2xl p-5 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-yellow-200 h-full"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">
                    My Reviews
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">
                    See what clients say about your services.
                  </p>
                  <span className="inline-flex items-center gap-1 text-yellow-600 text-sm font-medium group-hover:gap-2 transition-all">
                    Check reviews <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 md:p-8 border border-purple-100"
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg md:text-xl">
                    Tips to Boost Your Business
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Small things that make a big difference
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1.5">
                    💡 Tip 1
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <b>Respond quickly.</b> Providers who reply within 1 hour
                    get 2× more orders.
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1.5">
                    💰 Tip 2
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <b>Use price suggestions.</b> Our AI helps you price
                    services competitively.
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1.5">
                    ⭐ Tip 3
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <b>Keep clients happy.</b> 5-star reviews bring more clients
                    to your profile.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Categories Section untuk User saja */}
      {user?.role !== "provider" && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Popular Categories
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Choose from our most requested services
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <Link
                    to={`/services?category=${cat.name}`}
                    className="block bg-white rounded-2xl p-4 md:p-6 text-center shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 ${cat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-3`}
                    >
                      <cat.icon
                        className={`w-6 h-6 md:w-7 md:h-7 ${cat.textColor}`}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-xs md:text-sm">
                      {cat.name}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== AI Recommendations Section (Hanya untuk Client) ===== */}
      {user?.role === "client" && (
        <section className="py-12 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Recommendation for You !
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Services we think you'll love based on your activity
              </p>
            </motion.div>

            {loadingRecs ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
                <p className="text-gray-500 mt-2">Loading recommendations...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl shadow-md">
                <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  No recommendations yet. Start ordering to get personalized
                  suggestions!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                        {service.title}
                      </h3>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {service.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>
                        {service.avg_rating
                          ? Number(service.avg_rating).toFixed(1)
                          : "New"}
                      </span>
                      <span className="mx-1">•</span>
                      <span className="text-gray-400">
                        {service.provider_name}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-purple-700 mb-3">
                      Rp {Number(service.price).toLocaleString()}
                    </p>
                    <Link
                      to={`/services/${service.id}`}
                      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium transition"
                    >
                      View Service <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section for Non-Providers */}
      {user?.role !== "provider" && (
        <section className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                Want to offer your services?
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Join our community of trusted providers and grow your business
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Become a Provider
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2029 JasaGo. All rights reserved.</p>
          <p className="text-sm mt-2">Your trusted service marketplace</p>
        </div>
      </footer>

      {/* ===== Customer Service Toast ===== */}
      <CustomerServiceToast
        isOpen={csOpen}
        onClose={() => setCsOpen(false)}
        anchorRef={csButtonRef}
      />
    </div>
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
