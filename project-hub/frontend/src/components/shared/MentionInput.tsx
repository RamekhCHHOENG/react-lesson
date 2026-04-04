import { useState, useRef, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  memberNames?: string[]
  placeholder?: string
  className?: string
  rows?: number
}

export function MentionInput({
  value,
  onChange,
  memberNames = [],
  placeholder,
  className,
  rows = 3,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredMembers = memberNames.filter((name) =>
    name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      const cursor = e.target.selectionStart ?? 0
      onChange(newValue)
      setCursorPosition(cursor)

      // Check for @ mention trigger
      const textBeforeCursor = newValue.slice(0, cursor)
      const atIndex = textBeforeCursor.lastIndexOf("@")

      if (atIndex >= 0) {
        const textAfterAt = textBeforeCursor.slice(atIndex + 1)
        // Only show if @ is at start or after a space, and no space in the query
        if ((atIndex === 0 || textBeforeCursor[atIndex - 1] === " ") && !textAfterAt.includes(" ")) {
          setMentionQuery(textAfterAt)
          setShowSuggestions(true)
          return
        }
      }
      setShowSuggestions(false)
    },
    [onChange],
  )

  const insertMention = (name: string) => {
    const textBeforeCursor = value.slice(0, cursorPosition)
    const atIndex = textBeforeCursor.lastIndexOf("@")
    const before = value.slice(0, atIndex)
    const after = value.slice(cursorPosition)
    const newValue = `${before}@${name} ${after}`
    onChange(newValue)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      {showSuggestions && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 w-56 rounded-md border bg-popover shadow-md z-50">
          <div className="p-1">
            {filteredMembers.map((name) => (
              <button
                key={name}
                className={cn(
                  "w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                  "hover:bg-accent transition-colors text-left"
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  insertMention(name)
                }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-medium shrink-0">
                  {name[0]?.toUpperCase()}
                </span>
                <span className="truncate">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
