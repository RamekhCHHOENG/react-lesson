import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useCreateEpic, useUpdateEpic } from "@/hooks/useEpics"
import type { Epic, EpicFormData, EpicStatus } from "@/types"
import { EPIC_COLORS } from "@/types/epic"
import { cn } from "@/lib/utils"

const EPIC_STATUS_OPTIONS: { value: EpicStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

interface EpicFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  epic?: Epic | null
}

export function EpicFormDialog({ open, onOpenChange, projectId, epic }: EpicFormDialogProps) {
  const isEdit = !!epic
  const createEpic = useCreateEpic()
  const updateEpic = useUpdateEpic()

  const [form, setForm] = useState<EpicFormData>({
    name: "",
    description: "",
    color: EPIC_COLORS[0],
    status: "todo",
    start_date: "",
    target_date: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (epic) {
      setForm({
        name: epic.name,
        description: epic.description ?? "",
        color: epic.color,
        status: epic.status,
        start_date: epic.start_date ?? "",
        target_date: epic.target_date ?? "",
      })
    } else {
      setForm({ name: "", description: "", color: EPIC_COLORS[0], status: "todo", start_date: "", target_date: "" })
    }
    setErrors({})
  }, [epic, open])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Name is required"
    if (form.start_date && form.target_date && form.start_date > form.target_date) {
      errs.target_date = "Target date must be after start date"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const payload = { ...form, description: form.description || "" }
    if (isEdit) {
      updateEpic.mutate({ projectId, epicId: epic.id, data: payload }, {
        onSuccess: () => onOpenChange(false),
      })
    } else {
      createEpic.mutate({ projectId, data: payload }, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  const isPending = createEpic.isPending || updateEpic.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Epic" : "Create Epic"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update epic details." : "Create a new epic to group related issues."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="epic-name">Name *</Label>
            <Input
              id="epic-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. User Authentication"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="epic-desc">Description</Label>
            <Textarea
              id="epic-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe the epic's scope and goals"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {EPIC_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                    form.color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as EpicStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EPIC_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="epic-start">Start Date</Label>
              <Input
                id="epic-start"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epic-target">Target Date</Label>
              <Input
                id="epic-target"
                type="date"
                value={form.target_date}
                onChange={(e) => setForm({ ...form, target_date: e.target.value })}
              />
              {errors.target_date && <p className="text-xs text-destructive">{errors.target_date}</p>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Epic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
