"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export const SUPPORT_AREAS = [
  "Attribution Tracking",
  "CMO",
  "Consulting",
  "Content",
  "Infrastructure Development and builds",
  "Marketing Funnels",
  "Payment Processing",
  "Podcasting",
  "Recruiting",
  "SaaS",
  "Tax and Finance",
  "Venture Capital or M&A",
  "Web Design or Development",
]

type SupportAreasSelectProps = {
  value: string[]
  onChange: (value: string[]) => void
  onAddCustomArea?: (area: string) => void
  availableAreas?: string[]
}

export function SupportAreasSelect({
  value,
  onChange,
  onAddCustomArea,
  availableAreas = SUPPORT_AREAS,
}: SupportAreasSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [customInput, setCustomInput] = React.useState("")

  const handleSelect = (area: string) => {
    const newValue = value.includes(area) ? value.filter((v) => v !== area) : [...value, area]
    onChange(newValue)
  }

  const handleRemove = (area: string) => {
    onChange(value.filter((v) => v !== area))
  }

  const handleAddCustom = () => {
    if (customInput.trim() && !value.includes(customInput.trim()) && !availableAreas.includes(customInput.trim())) {
      const newArea = customInput.trim()
      onChange([...value, newArea])
      onAddCustomArea?.(newArea)
      setCustomInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customInput.trim()) {
      e.preventDefault()
      handleAddCustom()
    }
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-10 h-auto bg-transparent"
          >
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {value.slice(0, 3).map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
                {value.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{value.length - 3} more
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Select support areas...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or type custom area..."
              value={customInput}
              onValueChange={setCustomInput}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-sm text-muted-foreground py-2">
                  {customInput.trim() ? (
                    <Button variant="ghost" size="sm" className="w-full" onClick={handleAddCustom}>
                      Add "{customInput}"
                    </Button>
                  ) : (
                    "No areas found. Type to add custom area."
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {availableAreas.map((area) => (
                  <CommandItem key={area} value={area} onSelect={() => handleSelect(area)}>
                    <Check className={cn("mr-2 h-4 w-4", value.includes(area) ? "opacity-100" : "opacity-0")} />
                    {area}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((area) => (
            <Badge key={area} variant="secondary" className="text-xs gap-1">
              {area}
              <button type="button" onClick={() => handleRemove(area)} className="ml-1 hover:bg-muted rounded-full">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
