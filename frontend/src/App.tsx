import { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import logo from "./Jasa-removebg-preview.png"; // ← Import gambar logo

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import CreateService from "./pages/CreateService";
import EditService from "./pages/EditService";
import MyOrders from "./pages/MyOrder";
import OrderDetail from "./pages/OrderDetail";
import Payment from "./pages/Payment";
import PaymentProof from "./pages/PaymentProof";
import CreateReview from "./pages/CreateReview";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import MyServices from "./pages/MyServices";
import IncomingOrders from "./pages/incomingOrder";
import SeeReview from "./pages/seeReview";
import PasswordReset from "./pages/PasswordReset";
import AboutUs from "./pages/AboutUs";
// Welcome Screen Component
function WelcomeScreen() {
  const navigate = useNavigate();
  const [fadeout, setFadeout] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleStart = () => {
    setFadeout(true);
    setTimeout(() => navigate("/home", { replace: true }), 800);
  };

  const bubbleColors = [
    "bg-white/20",
    "bg-purple-300/30",
    "bg-pink-300/30",
    "bg-blue-300/30",
    "bg-yellow-300/20",
    "bg-green-300/20",
    "bg-indigo-300/30",
    "bg-rose-300/25",
  ];
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeout ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #9778df 0%, #1442a5 100%)",
      }}
    >
      {/* Floating Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => {
          const size = Math.random() * 80 + 20;
          const color =
            bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
          const duration = Math.random() * 8 + 6;
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          return (
            <motion.div
              key={i}
              className={`absolute ${color} rounded-full backdrop-blur-sm`}
              style={{
                width: size,
                height: size,
                left: `${startX}%`,
                top: `${startY}%`,
              }}
              animate={{
                y: [0, -80, 0],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Sparkle / Bintang Jatuh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            initial={{
              x: `${Math.random() * 100}%`,
              y: -20,
              opacity: 0,
            }}
            animate={{
              y: ["-20px", "110%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              delay: Math.random() * 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Sparkle Kedua - Efek berkedip di sekitar logo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`twinkle-${i}`}
            className="absolute w-1 h-1 bg-yellow-200 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 1,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content - Naik sedikit agar lebih pas di tengah */}
      <div className="text-center space-y-5 px-4 z-10 relative -mt-8">
        {/* Logo Gambar */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="flex justify-center"
        >
          <img
            src={logo}
            alt="JASAGO Logo"
            className="w-150 h-94 object-cover object-center rounded-2xl"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.3 },
            },
          }}
          className=" md:text-4xl font-bold text-white tracking-tight"
        >
          {[
            "G",
            "I",
            "O",
            "V",
            "A",
            "N",
            " ",
            "C",
            "O",
            "M",
            "P",
            "A",
            "N",
            "Y",
            " ",
            "C",
            "O",
            "R",
            "P",
            "O",
            "R",
            "A",
            "T",
            "I",
            "O",
            "N",
          ].map((letter, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: { y: 50, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              transition={{ duration: 0.7 }}
              className="inline-block"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-purple-100 text-lg"
        >
          Your Trusted Service Marketplace
        </motion.p>

        {/* Garis dekorasi - RIPPLE EFFECT */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.5 }}
          transition={{ delay: 1, duration: 1.3 }}
          className="flex justify-center"
        >
          <div className="w-64 h-0.5 bg-white rounded-full origin-center" />
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleStart}
            className="bg-white text-xl text-blue-900 hover:bg-purple-50 hover:scale-105 transition-all duration-300 shadow-xl rounded-full px-8 py-6 font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:text-white-400"
          >
            Get Started
            <ChevronRight className="w-32 h-10 group-hover:translate-x-2 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Router Configuration
const router = createBrowserRouter([
  { path: "/", element: <WelcomeScreen /> },
  { path: "/home", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/services", element: <Services /> },
  { path: "/services/:id", element: <ServiceDetail /> },
  { path: "/create-service", element: <CreateService /> },
  { path: "/edit-service/:id", element: <EditService /> },
  { path: "/my-orders", element: <MyOrders /> },
  { path: "/orders/:id", element: <OrderDetail /> },
  { path: "/payment/:orderId", element: <Payment /> },
  { path: "/payment-proof/:orderId", element: <PaymentProof /> },
  { path: "/create-review/:orderId", element: <CreateReview /> },
  { path: "/profile", element: <Profile /> },
  { path: "/admin", element: <AdminDashboard /> },
  { path: "*", element: <NotFound /> },
  { path: "/my-services", element: <MyServices /> },
  { path: "/incoming-orders", element: <IncomingOrders /> },
  { path: "/providers-review", element: <SeeReview /> },
  { path: "/password-reset/:token?", element: <PasswordReset /> },
  { path: "/about-us", element: <AboutUs /> },
]);

// Main App Component
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
