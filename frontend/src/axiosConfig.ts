import axios from "axios";

declare global {
  interface ImportMetaEnv {
    DEV: any;
    readonly VITE_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Cek apakah sedang di mode development atau production
const isDev = import.meta.env.DEV;

// Di development: pakai localhost:2500 (kalau ENV tidak ada)
// Di production: pakai "" (kosong) supaya request jadi relative → proxy Vercel
const baseURL =
  import.meta.env.VITE_API_URL || (isDev ? "http://localhost:2500" : "");

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
