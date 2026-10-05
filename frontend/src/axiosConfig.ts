import axios from "axios";

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Buat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:2500",
  withCredentials: true, // 🔥 Kirim cookie otomatis setiap request
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
//ini untuk mengatur konfigurasi atau pengaturan defaul untuk axios, misalnya baseURL, headers, dan lain-lain, dengan tujuan agar setiap request yang dikirim menggunakan instance atau one axios ini akan memiliki konfigurasi yang sama, sehingga tidak perlu mengatur konfigurasi setiap kali melakukan request.
