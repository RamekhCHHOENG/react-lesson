/**
 * MSW Browser Worker
 *
 * Sets up the Mock Service Worker for browser environments.
 * This intercepts all fetch() calls matching our handlers.
 *
 * When switching to a real backend, simply remove the MSW startup
 * from main.tsx — all fetch() calls will go to the real server.
 */

import { setupWorker } from "msw/browser"
import { handlers } from "./handlers"

export const worker = setupWorker(...handlers)
