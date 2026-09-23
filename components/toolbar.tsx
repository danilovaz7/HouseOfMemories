"use client"

import { Cloud, Plus, Tags } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

type ToolbarProps = {
  categories: Category[]
  activeCategoryId: string | "all"
  onFilter: (id: string | "all") => void
  onAdd: () => void
  onManageTypes: () => void
}

export function Toolbar({
  categories,
  activeCategoryId,
  onFilter,
  onAdd,
  onManageTypes,
}: ToolbarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-3 max-md:top-auto max-md:bottom-4">
      <div className="pointer-events-auto flex max-w-[min(960px,100%)] flex-col items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-2 py-2 shadow-[0_12px_40px_-18px_rgba(30,80,140,0.55)] backdrop-blur-xl">
          <div className="hidden items-center gap-2 pl-3 pr-1 sm:flex">
            <Cloud className="size-4 text-sky-700" />
            <span className="font-heading text-sm font-semibold tracking-tight text-slate-800">
              House of Memories
            </span>
          </div>
          <Button
            size="sm"
            className="rounded-full bg-sky-700 px-3 text-white hover:bg-sky-800"
            onClick={onAdd}
          >
            <Plus data-icon="inline-start" />
            Nova lembrança
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-slate-700 hover:bg-white/70"
            onClick={onManageTypes}
          >
            <Tags data-icon="inline-start" />
            Tipos
          </Button>
        </div>
        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-white/50 bg-white/45 p-1 shadow-[0_10px_30px_-20px_rgba(30,80,140,0.5)] backdrop-blur-lg">
          <FilterChip
            label="Todos"
            active={activeCategoryId === "all"}
            onClick={() => onFilter("all")}
          />
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              label={category.name}
              color={category.color}
              active={activeCategoryId === category.id}
              onClick={() => onFilter(category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string
  color?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-slate-800 text-white"
          : "text-slate-700 hover:bg-white/80",
      )}
    >
      {color ? (
        <span
          className="size-2 rounded-full ring-1 ring-white/80"
          style={{ background: color }}
        />
      ) : null}
      {label}
    </button>
  )
}
