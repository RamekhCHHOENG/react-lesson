import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects"
import { PROJECT_STATUS_CONFIG, PROJECT_PRIORITY_CONFIG } from "@/config"
import type {
  Project,
  ProjectFormData,
  ProjectStatus,
  ProjectPriority,
} from "@/types"

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  onSuccess?: () => void
}

const defaultFormData: ProjectFormData = {
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  start_date: new Date().toISOString().split("T")[0],
  end_date: undefined,
}

export default function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ProjectFormDialogProps) {
  const isEditing = !!project
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData({
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          start_date: project.start_date
            ? project.start_date.split("T")[0]
            : "",
          end_date: project.end_date
            ? project.end_date.split("T")[0]
            : undefined,
        })
      } else {
        setFormData(defaultFormData)
      }
      setErrors({})
    }
  }, [open, project])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required"
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required"
    }
    if (
      formData.end_date &&
      formData.start_date &&
      formData.end_date < formData.start_date
    ) {
      newErrors.end_date = "End date must be after start date"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const payload: ProjectFormData = {
      ...formData,
      end_date: formData.end_date || undefined,
    }

    try {
      if (isEditing) {
        await updateProject.mutateAsync({ id: project.id, data: payload })
      } else {
        await createProject.mutateAsync(payload)
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Error toast is handled by the mutation hooks
    }
  }

  const isPending = createProject.isPending || updateProject.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the project details below."
                : "Fill in the details to create a new project."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                placeholder="e.g. Website Redesign"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Brief description of the project..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ProjectStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUS_CONFIG).map(
                      ([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: ProjectPriority) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_PRIORITY_CONFIG).map(
                      ([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-start-date">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="project-start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                />
                {errors.start_date && (
                  <p className="text-xs text-destructive">
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-end-date">End Date</Label>
                <Input
                  id="project-end-date"
                  type="date"
                  value={formData.end_date ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_date: e.target.value || undefined,
                    }))
                  }
                />
                {errors.end_date && (
                  <p className="text-xs text-destructive">{errors.end_date}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
