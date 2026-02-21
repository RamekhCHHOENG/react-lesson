import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

/**
 * Start the app with MSW (Mock Service Worker).
 *
 * MSW intercepts all fetch() calls and serves data from an in-memory store.
 * This makes the app behave exactly like it's connected to a real backend —
 * works in both development AND production builds.
 *
 * When connecting to a real Spring Boot API:
 *   1. Remove the MSW startup block below
 *   2. Change BASE_URL in src/services/api.ts
 *   3. Done — all fetch() calls go to the real server
 */
async function startApp() {
  // Start MSW — intercepts fetch() at network level (dev + production)
  const { worker } = await import("./mocks/browser")
  await worker.start({
    onUnhandledRequest: "bypass", // let other requests through (e.g., static assets)
    quiet: true, // suppress MSW request logs in production console
  })
  console.log("[MSW] Mock API server started — data stored in memory")

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

startApp()
