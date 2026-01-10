import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PWA Service Worker
// Importante: não registre SW em DEV, pois ele pode cachear assets e quebrar o HMR do Vite
// (erros de WebSocket/MIME type "text/html").
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed, app will still work
    });
  });
} else if (import.meta.env.DEV && "serviceWorker" in navigator) {
  // Se já existia um SW registrado (de um build anterior), tente remover para não interferir no dev.
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  }).catch(() => {
    // ignore
  });
}

createRoot(document.getElementById("root")!).render(<App />);
