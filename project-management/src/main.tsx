import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { seedIfEmpty } from "@/services/seedData"
import App from "./App"
import "./index.css"

// Pre-populate demo data on first launch
seedIfEmpty()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
