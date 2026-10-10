import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Mail, Phone, Clock, Headphones } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
};

export default function CustomerServiceToast({
  isOpen,
  onClose,
  anchorRef,
}: Props) {
  // ============================================
  // 📞 KONFIGURASI KONTAK — GANTI DI SINI
  // ============================================
  const WA_NUMBER_DISPLAY = "+62 811-6569-998";
  const WA_NUMBER_LINK = "628116569998";
  const WA_MESSAGE = "Halo JasaGo, saya butuh bantuan";
  const EMAIL = "giovanwongso@gmail.com";
  const PHONE_DISPLAY = "+62 811-6569-998";
  const PHONE_LINK = "+628116569998";

  const waHref = `https://wa.me/${WA_NUMBER_LINK}?text=${encodeURIComponent(
    WA_MESSAGE,
  )}`;

  const contacts = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: WA_NUMBER_DISPLAY,
      href: waHref,
      colorClass: "bg-green-100 text-green-600",
      hoverClass: "hover:border-green-300 hover:bg-green-50/50",
    },
    {
      icon: Mail,
      label: "Email",
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      colorClass: "bg-blue-100 text-blue-600",
      hoverClass: "hover:border-blue-300 hover:bg-blue-50/50",
    },
    {
      icon: Phone,
      label: "Phone",
      value: PHONE_DISPLAY,
      href: `tel:${PHONE_LINK}`,
      colorClass: "bg-purple-100 text-purple-600",
      hoverClass: "hover:border-purple-300 hover:bg-purple-50/50",
    },
  ];

  // ===== STATE POSISI TOAST =====
  const [position, setPosition] = useState<{ top: number; right: number }>({
    top: 80,
    right: 16,
  });

  // ===== REF TOAST (untuk deteksi klik luar) =====
  const toastRef = useRef<HTMLDivElement>(null);

  // ===== HITUNG POSISI TOAST SAAT DIBUKA =====
  useEffect(() => {
    if (!isOpen) return;

    const computePosition = () => {
      if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
          // Di mobile: pakai margin 16px dari kanan, di bawah navbar
          setPosition({
            top: 70,
            right: 16,
          });
        } else {
          // Di desktop: tepat di bawah tombol, sejajar sisi kanan
          setPosition({
            top: rect.bottom + 10,
            right: window.innerWidth - rect.right,
          });
        }
      }
    };

    computePosition();

    // Recompute saat resize
    window.addEventListener("resize", computePosition);
    return () => window.removeEventListener("resize", computePosition);
  }, [isOpen, anchorRef]);

  // ===== DETEKSI KLIK DI LUAR =====
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        toastRef.current &&
        !toastRef.current.contains(target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };

    // Delay agar klik pembuka tidak langsung menutup toast
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={toastRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-purple-100 p-5 z-[100]"
          style={{
            top: `${position.top}px`,
            right: `${position.right}px`,
            boxShadow:
              "0 25px 50px -12px rgba(124, 58, 237, 0.35), 0 0 0 1px rgba(167, 139, 250, 0.1)",
          }}
        >
          {/* Decorative gradient bar */}
          <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-t-2xl" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white">
                <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-base leading-tight">
                Customer Service
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Online now
              </p>
            </div>
          </div>

          {/* Contact list */}
          <div className="space-y-2">
            {contacts.map((c, i) => (
              <motion.a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 transition-all duration-200 ${c.hoverClass}`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.colorClass}`}
                >
                  <c.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide leading-tight">
                    {c.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                    {c.value}
                  </p>
                </div>
                <svg
                  className="w-3.5 h-3.5 text-gray-300 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.a>
            ))}
          </div>

          {/* Operating hours */}
          <div className="mt-3.5 flex items-center gap-2 text-[11px] text-gray-500 bg-purple-50/60 rounded-lg px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
            <span>
              <b className="text-gray-700">Mon–Fri</b> 08:00–20:00 WIB
              <span className="mx-1.5 text-gray-300">•</span>
              <b className="text-gray-700">Sat</b> 09:00–17:00
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
