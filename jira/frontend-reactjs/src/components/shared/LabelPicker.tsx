import { useLabels } from "@/hooks/useLabels"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Tags, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface LabelPickerProps {
  value: string[]
  onChange: (labels: string[]) => void
  className?: string
}

export function LabelPicker({ value, onChange, className }: LabelPickerProps) {
  const { data: labels } = useLabels()

  const toggle = (name: string) => {
    if (value.includes(name)) {
      onChange(value.filter((v) => v !== name))
    } else {
      onChange([...value, name])
    }
  }

  const selectedLabels = labels?.filter((l) => value.includes(l.name)) ?? []

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              className="text-xs gap-1 pr-1"
              style={{ borderColor: label.color, color: label.color }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: label.color }} />
              {label.name}
              <button
                onClick={() => toggle(label.name)}
                className="ml-0.5 rounded-full hover:bg-accent p-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Tags className="mr-1.5 h-3.5 w-3.5" />
            {selectedLabels.length > 0 ? `${selectedLabels.length} selected` : "Add labels"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          {!labels || labels.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No labels available. Create labels in Settings.
            </p>
          ) : (
            <div className="space-y-0.5 max-h-48 overflow-auto">
              {labels.map((label) => (
                <button
                  key={label.id}
                  className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                  onClick={() => toggle(label.name)}
                >
                  <Checkbox checked={value.includes(label.name)} className="pointer-events-none" />
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                  <span className="truncate">{label.name}</span>
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
