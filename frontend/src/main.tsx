import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { PrivyProvider } from "./providers/PrivyProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <PrivyProvider>
    <App />
  </PrivyProvider>
);
