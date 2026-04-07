import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import axios from "axios";
import "./index.css";

// Use environment variable for backend URL in production, defaults to relative / proxy in development
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";
axios.defaults.withCredentials = true; // Ensure cookies are always sent

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
