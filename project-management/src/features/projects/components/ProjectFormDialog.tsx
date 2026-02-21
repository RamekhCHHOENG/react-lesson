import { useState, useEffect } from "react"
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
import { DatePicker } from "@/components/ui/date-picker"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
 DialogDescription,
} from "@/components/ui/dialog"
import type { ProjectFormData, ProjectStatus, ProjectPriority } from "@/types/project"

interface ProjectFormDialogProps {
 open: boolean
 onClose: () => void
 onSubmit: (data: ProjectFormData) => void
 initialData?: Partial<ProjectFormData>
 title?: string
 isLoading?: boolean
}

const emptyForm: ProjectFormData = {
 name: "",
 description: "",
 status: "planning",
 priority: "medium",
 startDate: new Date().toISOString().split("T")[0],
 endDate: "",
 tags: [],
}

export function ProjectFormDialog({
 open,
 onClose,
 onSubmit,
 initialData,
 title = "New Project",
 isLoading = false,
}: ProjectFormDialogProps) {
 const [form, setForm] = useState<ProjectFormData>({ ...emptyForm, ...initialData })
 const [tagInput, setTagInput] = useState("")

 useEffect(() => {
 if (open) {
 setForm({ ...emptyForm, ...initialData })
 setTagInput("")
 }
 }, [open, initialData])

 const handleChange = (field: keyof ProjectFormData, value: string) => {
 setForm((prev) => ({ ...prev, [field]: value }))
 }

 const handleAddTag = () => {
 const tag = tagInput.trim()
 if (tag && !form.tags.includes(tag)) {
 setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
 setTagInput("")
 }
 }

 const handleRemoveTag = (tag: string) => {
 setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
 }

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault()
 onSubmit(form)
 onClose()
 }

 return (
 <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
 <DialogContent className="sm:max-w-[520px]">
 <DialogHeader>
 <DialogTitle>{title}</DialogTitle>
 <DialogDescription>Fill in the project details below.</DialogDescription>
 </DialogHeader>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="name">Project Name</Label>
 <Input
 id="name"
 value={form.name}
 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
 placeholder="Enter project name"
 required
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="description">Description</Label>
 <Textarea
 id="description"
 value={form.description}
 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("description", e.target.value)}
 placeholder="Enter project description"
 rows={3}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="status">Status</Label>
 <Select
 value={form.status}
 onValueChange={(value) => handleChange("status", value as ProjectStatus)}
 >
 <SelectTrigger id="status">
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="planning">Planning</SelectItem>
 <SelectItem value="in-progress">In Progress</SelectItem>
 <SelectItem value="on-hold">On Hold</SelectItem>
 <SelectItem value="completed">Completed</SelectItem>
 <SelectItem value="cancelled">Cancelled</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="priority">Priority</Label>
 <Select
 value={form.priority}
 onValueChange={(value) => handleChange("priority", value as ProjectPriority)}
 >
 <SelectTrigger id="priority">
 <SelectValue placeholder="Select priority" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="low">Low</SelectItem>
 <SelectItem value="medium">Medium</SelectItem>
 <SelectItem value="high">High</SelectItem>
 <SelectItem value="urgent">Urgent</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="startDate">Start Date</Label>
 <DatePicker
 id="startDate"
 value={form.startDate}
 onChange={(value) => handleChange("startDate", value)}
 placeholder="Pick start date"
 required
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="endDate">End Date</Label>
 <DatePicker
 id="endDate"
 value={form.endDate}
 onChange={(value) => handleChange("endDate", value)}
 placeholder="Pick end date"
 />
 </div>
 </div>

 <div className="space-y-2">
 <Label>Tags</Label>
 <div className="flex gap-2">
 <Input
 value={tagInput}
 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
 placeholder="Add tag"
 onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
 if (e.key === "Enter") {
 e.preventDefault()
 handleAddTag()
 }
 }}
 />
 <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
 Add
 </Button>
 </div>
 {form.tags.length > 0 && (
 <div className="flex flex-wrap gap-1 mt-2">
 {form.tags.map((tag) => (
 <span
 key={tag}
 className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
 >
 {tag}
 <button
 type="button"
 onClick={() => handleRemoveTag(tag)}
 className="hover:text-destructive"
 >
 ×
 </button>
 </span>
 ))}
 </div>
 )}
 </div>

 <DialogFooter>
 <Button type="button" variant="outline" onClick={onClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={isLoading || !form.name.trim()}>
 {isLoading ? "Saving..." : "Save"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 )
}
