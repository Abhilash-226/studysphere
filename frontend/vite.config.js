import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy image requests to avoid CORS issues
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // Proxy API requests
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
