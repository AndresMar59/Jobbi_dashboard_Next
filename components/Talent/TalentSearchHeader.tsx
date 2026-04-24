"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function TalentSearchHeader({ onSearch }: { onSearch: (type: string, id: string) => void }) {
  const [type, setType] = useState<"company" | "posting">("company")
  const [value, setValue] = useState("")

  return (
    <div className="flex gap-2 w-full">
      <div className="flex p-1 bg-muted rounded-lg h-10">
        <Button 
          variant={type === "company" ? "secondary" : "ghost"} 
          size="sm" 
          className="h-8"
          onClick={() => setType("company")}
        >Company</Button>
        <Button 
          variant={type === "posting" ? "secondary" : "ghost"} 
          size="sm"
          className="h-8"
          onClick={() => setType("posting")}
        >Posting</Button>
      </div>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-9 bg-card h-10"
          placeholder="Buscar ID (vacío para global)..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(type, value)}
        />
      </div>
    </div>
  )
}