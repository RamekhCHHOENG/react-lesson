import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

const PRESET_COLORS = [
  "#0065FF",
  "#6554C0",
  "#FF5630",
  "#FF991F",
  "#36B37E",
  "#00B8D9",
  "#6B778C",
  "#E91E63",
  "#4ECDC4",
  "#45B7D1",
  "#9C27B0",
  "#FF6B6B",
]

interface AddColumnDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (label: string, color: string) => void
}

export function AddColumnDialog({ open, onClose, onAdd }: AddColumnDialogProps) {
  const [label, setLabel] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    onAdd(label.trim(), color)
    setLabel("")
    setColor(PRESET_COLORS[0])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Add Column</DialogTitle>
          <DialogDescription>
            Add a new status column to your board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="colName">Column Name</Label>
            <Input
              id="colName"
              value={label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLabel(e.target.value)
              }
              placeholder="e.g. QA Testing"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-foreground scale-110 ring-2 ring-ring ring-offset-1"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!label.trim()}>
              Add Column
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
