import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API and auth requests to backend during dev
      "/api": "http://localhost:5000",
      "/auth": "http://localhost:5000",
    },
  },
});
