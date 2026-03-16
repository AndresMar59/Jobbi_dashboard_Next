"use client"

import * as React from "react"

// Lightweight select components (no external dependency needed)
const Select = React.forwardRef<
  HTMLDivElement,
  {
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
  }
>(({ value, onValueChange, children }, ref) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value || "")
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const contextValue = React.useMemo(
    () => ({
      value: internalValue,
      open,
      setOpen,
      onSelect: (val: string) => {
        setInternalValue(val)
        onValueChange?.(val)
        setOpen(false)
      },
    }),
    [internalValue, open, onValueChange]
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </SelectContext.Provider>
  )
})
Select.displayName = "Select"

interface SelectContextType {
  value: string
  open: boolean
  setOpen: (open: boolean) => void
  onSelect: (value: string) => void
}

const SelectContext = React.createContext<SelectContextType>({
  value: "",
  open: false,
  setOpen: () => {},
  onSelect: () => {},
})

const useSelectContext = () => React.useContext(SelectContext)

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { setOpen, open } = useSelectContext()
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-9 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
        {...props}
      >
        {children}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useSelectContext()
  return <span className="truncate">{value || placeholder || ""}</span>
}

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = useSelectContext()
    if (!open) return null
    return (
      <div
        ref={ref}
        className={`absolute z-50 mt-1 min-w-[8rem] w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${className || ""}`}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const { onSelect, value: selectedValue } = useSelectContext()
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={selectedValue === value}
      onClick={() => onSelect(value)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${selectedValue === value ? "bg-accent/50" : ""} ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
