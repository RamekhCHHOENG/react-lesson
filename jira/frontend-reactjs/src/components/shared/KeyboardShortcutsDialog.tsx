import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const categories = [...new Set(SHORTCUTS.map((s) => s.category))]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-auto">
          {categories.map((cat, i) => (
            <div key={cat}>
              {i > 0 && <Separator className="my-3" />}
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {cat}
              </p>
              <div className="space-y-2">
                {SHORTCUTS.filter((s) => s.category === cat).map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between">
                    <span className="text-sm">{shortcut.label}</span>
                    <div className="flex gap-1">
                      {shortcut.key.split(" ").map((part, j) => (
                        part === "then" ? (
                          <span key={j} className="text-xs text-muted-foreground px-1">then</span>
                        ) : (
                          <kbd
                            key={j}
                            className="inline-flex h-6 min-w-6 items-center justify-center rounded border bg-muted px-1.5 font-mono text-xs"
                          >
                            {part}
                          </kbd>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
