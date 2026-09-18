import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Dev proxy nginx qoidasining nusxasi (deploy/nginx.conf):
//   /api/health -> server /health (prefikssiz)
//   /api/*      -> server /api/*
// Shunda VITE_API_URL bo'sh holda dev va prod bir xil ishlaydi.
const SERVER_URL = process.env.VITE_DEV_SERVER_PROXY ?? "http://localhost:4000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/health": { target: SERVER_URL, rewrite: () => "/health" },
      "/api": { target: SERVER_URL },
    },
  },
});
