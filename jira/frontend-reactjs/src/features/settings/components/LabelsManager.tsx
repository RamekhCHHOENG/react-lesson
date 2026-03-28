import { useState } from "react"
import { useLabels, useCreateLabel, useUpdateLabel, useDeleteLabel } from "@/hooks/useLabels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label as LabelUI } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Label, LabelFormData } from "@/types"
import { LABEL_COLORS } from "@/types/label"

export function LabelsManager() {
  const { data: labels, isLoading } = useLabels()
  const createLabel = useCreateLabel()
  const updateLabel = useUpdateLabel()
  const deleteLabel = useDeleteLabel()

  const [showForm, setShowForm] = useState(false)
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Label | null>(null)
  const [form, setForm] = useState<LabelFormData>({ name: "", color: LABEL_COLORS[0], description: "" })

  const resetForm = () => {
    setForm({ name: "", color: LABEL_COLORS[0], description: "" })
    setShowForm(false)
    setEditingLabel(null)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingLabel) {
      updateLabel.mutate({ labelId: editingLabel.id, data: form }, { onSuccess: resetForm })
    } else {
      createLabel.mutate(form, { onSuccess: resetForm })
    }
  }

  const startEdit = (label: Label) => {
    setEditingLabel(label)
    setForm({ name: label.name, color: label.color, description: label.description ?? "" })
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{labels?.length ?? 0} labels</p>
        {!showForm && (
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            New Label
          </Button>
        )}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-md border p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <LabelUI className="text-xs">Name *</LabelUI>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Frontend"
                className="h-8"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <LabelUI className="text-xs">Description</LabelUI>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional"
                className="h-8"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <LabelUI className="text-xs">Color</LabelUI>
            <div className="flex flex-wrap gap-1.5">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                    form.color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7" onClick={handleSave} disabled={!form.name.trim()}>
              <Check className="mr-1 h-3.5 w-3.5" />
              {editingLabel ? "Update" : "Create"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7" onClick={resetForm}>
              <X className="mr-1 h-3.5 w-3.5" />Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Label list */}
      <div className="space-y-1">
        {labels?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No labels yet. Create one to get started.</p>
        )}
        {labels?.map((label) => (
          <div key={label.id} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/50 group">
            <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
            <span className="text-sm font-medium flex-1">{label.name}</span>
            {label.description && (
              <span className="text-xs text-muted-foreground truncate max-w-48">{label.description}</span>
            )}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(label)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(label)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Label</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{deleteTarget?.name}"? Tasks using this label will still exist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteLabel.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
