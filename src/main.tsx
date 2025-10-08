import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function showOverlay(message: string) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.9)";
  overlay.style.color = "#fff";
  overlay.style.zIndex = "999999";
  overlay.style.padding = "24px";
  overlay.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace";
  overlay.style.whiteSpace = "pre-wrap";
  overlay.textContent = message;
  document.body.appendChild(overlay);
}

window.addEventListener("error", (e) => {
  const msg = `[GlobalError] ${e.message}\n${e.error?.stack ?? ""}`;
  console.error(msg);
  showOverlay(msg);
});
window.addEventListener("unhandledrejection", (e) => {
  const msg = `[UnhandledRejection] ${String(e.reason)}\n${e.reason?.stack ?? ""}`;
  console.error(msg);
  showOverlay(msg);
});

console.log("[App] Bootstrapping...");

const rootEl = document.getElementById("root");
if (!rootEl) {
  const msg = "[App] #root not found";
  console.error(msg);
  showOverlay(msg);
} else {
  try {
    createRoot(rootEl).render(<App />);
  } catch (err) {
    const message = "[App] Render failed: " + (err instanceof Error ? `${err.message}\n${err.stack}` : String(err));
    console.error(message);
    showOverlay(message);
  }
}

