/**
 * MSW Request Handlers
 *
 * These HTTP route handlers work like Spring Boot @RestController methods.
 * They intercept real fetch() calls and return data from the in-memory database.
 *
 * When you connect a real backend (e.g., Spring Boot), remove these handlers —
 * the fetch() calls in api.ts will go directly to the real server.
 */

import { http, HttpResponse, delay } from "msw"
import { db } from "./db"
import type { ProjectFormData, TaskFormData } from "@/types/project"

// Simulated network latency (ms) — makes it feel like a real API
const API_DELAY = 120

export const handlers = [
  // ── GET /api/projects ──────────────────────────────────────
  http.get("/api/projects", async () => {
    await delay(API_DELAY)
    return HttpResponse.json({
      data: db.projects.findAll(),
      success: true,
    })
  }),

  // ── GET /api/projects/:id ──────────────────────────────────
  http.get("/api/projects/:id", async ({ params }) => {
    await delay(API_DELAY)
    const project = db.projects.findById(params.id as string)
    if (!project) {
      return HttpResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
    }
    return HttpResponse.json({ data: project, success: true })
  }),

  // ── POST /api/projects ─────────────────────────────────────
  http.post("/api/projects", async ({ request }) => {
    await delay(API_DELAY)
    const body = (await request.json()) as ProjectFormData
    const project = db.projects.create(body)
    return HttpResponse.json(
      { data: project, success: true, message: "Project created successfully" },
      { status: 201 }
    )
  }),

  // ── PUT /api/projects/:id ──────────────────────────────────
  http.put("/api/projects/:id", async ({ params, request }) => {
    await delay(API_DELAY)
    const body = (await request.json()) as Partial<ProjectFormData>
    const project = db.projects.update(params.id as string, body)
    if (!project) {
      return HttpResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      data: project,
      success: true,
      message: "Project updated successfully",
    })
  }),

  // ── DELETE /api/projects/:id ───────────────────────────────
  http.delete("/api/projects/:id", async ({ params }) => {
    await delay(API_DELAY)
    const deleted = db.projects.delete(params.id as string)
    if (!deleted) {
      return HttpResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      data: null,
      success: true,
      message: "Project deleted successfully",
    })
  }),

  // ── POST /api/projects/:id/tasks ───────────────────────────
  http.post("/api/projects/:projectId/tasks", async ({ params, request }) => {
    await delay(API_DELAY)
    const body = (await request.json()) as TaskFormData
    const task = db.tasks.add(params.projectId as string, body)
    if (!task) {
      return HttpResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
    }
    return HttpResponse.json(
      { data: task, success: true, message: "Task created successfully" },
      { status: 201 }
    )
  }),

  // ── PUT /api/projects/:id/tasks/:taskId ────────────────────
  http.put(
    "/api/projects/:projectId/tasks/:taskId",
    async ({ params, request }) => {
      await delay(API_DELAY)
      const body = (await request.json()) as Partial<TaskFormData>
      const task = db.tasks.update(
        params.projectId as string,
        params.taskId as string,
        body
      )
      if (!task) {
        return HttpResponse.json(
          { success: false, message: "Task not found" },
          { status: 404 }
        )
      }
      return HttpResponse.json({
        data: task,
        success: true,
        message: "Task updated successfully",
      })
    }
  ),

  // ── DELETE /api/projects/:id/tasks/:taskId ─────────────────
  http.delete(
    "/api/projects/:projectId/tasks/:taskId",
    async ({ params }) => {
      await delay(API_DELAY)
      const deleted = db.tasks.delete(
        params.projectId as string,
        params.taskId as string
      )
      if (!deleted) {
        return HttpResponse.json(
          { success: false, message: "Task not found" },
          { status: 404 }
        )
      }
      return HttpResponse.json({
        data: null,
        success: true,
        message: "Task deleted successfully",
      })
    }
  ),

  // ── GET /api/search?q=query ────────────────────────────────
  http.get("/api/search", async ({ request }) => {
    await delay(80)
    const url = new URL(request.url)
    const query = url.searchParams.get("q") ?? ""
    return HttpResponse.json({
      data: db.search(query),
      success: true,
    })
  }),

  // ── GET /api/storage/info ──────────────────────────────────
  http.get("/api/storage/info", async () => {
    await delay(50)
    return HttpResponse.json({
      data: db.storage.getInfo(),
      success: true,
    })
  }),

  // ── DELETE /api/storage/clear ──────────────────────────────
  http.delete("/api/storage/clear", async () => {
    await delay(API_DELAY)
    db.storage.clear()
    return HttpResponse.json({
      data: null,
      success: true,
      message: "All data cleared",
    })
  }),

  // ── POST /api/storage/reseed ───────────────────────────────
  http.post("/api/storage/reseed", async () => {
    await delay(API_DELAY)
    db.storage.reseed()
    return HttpResponse.json({
      data: null,
      success: true,
      message: "Database re-seeded with demo data",
    })
  }),

  // ── GET /api/storage/export ────────────────────────────────
  http.get("/api/storage/export", async () => {
    await delay(50)
    return HttpResponse.json({
      data: db.storage.exportJSON(),
      success: true,
    })
  }),
]
