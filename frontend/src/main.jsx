// src/main.jsx
// Application entry point — mounts React into the DOM
// Wraps everything in BrowserRouter, AuthProvider, and Toaster

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import App from "./App.jsx";
import "./index.css";

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* BrowserRouter enables client-side routing */}
    <BrowserRouter>
      {/* AuthProvider makes user/login/logout available everywhere */}
      <AuthProvider>
        <App />
        {/* Toaster renders toast notifications globally */}
        <Toaster position="top-right" reverseOrder={false} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);