import React from "react";
import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import "./style.css";
import App from "./App";

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider />
      <App />
    </HeroUIProvider>
  </React.StrictMode>
);
