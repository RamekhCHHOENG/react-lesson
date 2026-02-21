import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
 DialogDescription,
} from "@/components/ui/dialog"
import { getTaskStatusConfig } from "@/config"
import { useBoardColumns } from "@/hooks/useBoardColumns"
import type { TaskFormData, TaskStatus } from "@/types/project"

interface TaskFormDialogProps {
 open: boolean
 onClose: () => void
 onSubmit: (data: TaskFormData) => void
 initialData?: Partial<TaskFormData>
 title?: string
 isLoading?: boolean
}

const emptyTask: TaskFormData = {
 title: "",
 description: "",
 status: "todo",
 assignee: "",
 dueDate: "",
}

export function TaskFormDialog({
 open,
 onClose,
 onSubmit,
 initialData,
 title = "New Task",
 isLoading = false,
}: TaskFormDialogProps) {
 const [form, setForm] = useState<TaskFormData>({ ...emptyTask, ...initialData })
 const { columns } = useBoardColumns()

 useEffect(() => {
 if (open) {
 setForm({ ...emptyTask, ...initialData })
 }
 }, [open, initialData])

 const handleChange = (field: keyof TaskFormData, value: string) => {
 setForm((prev) => ({ ...prev, [field]: value }))
 }

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault()
 onSubmit(form)
 onClose()
 }

 return (
 <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
 <DialogContent className="sm:max-w-[460px]">
 <DialogHeader>
 <DialogTitle>{title}</DialogTitle>
 <DialogDescription>Fill in the task details below.</DialogDescription>
 </DialogHeader>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="taskTitle">Title</Label>
 <Input
 id="taskTitle"
 value={form.title}
 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("title", e.target.value)}
 placeholder="Enter task title"
 required
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="taskDesc">Description</Label>
 <Textarea
 id="taskDesc"
 value={form.description}
 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("description", e.target.value)}
 placeholder="Enter task description"
 rows={2}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="taskStatus">Status</Label>
 <Select
 value={form.status}
 onValueChange={(value) => handleChange("status", value as TaskStatus)}
 >
 <SelectTrigger id="taskStatus">
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 {columns.map((col) => {
 const cfg = getTaskStatusConfig(col.key)
 return (
 <SelectItem key={col.key} value={col.key}>
 {cfg.label}
 </SelectItem>
 )
 })}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label htmlFor="assignee">Assignee</Label>
 <Input
 id="assignee"
 value={form.assignee}
 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("assignee", e.target.value)}
 placeholder="Name"
 />
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="dueDate">Due Date</Label>
 <DatePicker
 id="dueDate"
 value={form.dueDate}
 onChange={(value) => handleChange("dueDate", value)}
 placeholder="Pick a due date"
 />
 </div>

 <DialogFooter>
 <Button type="button" variant="outline" onClick={onClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={isLoading || !form.title.trim()}>
 {isLoading ? "Saving..." : "Save"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 )
}
