"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CATEGORY_COLORS, type Category } from "@/lib/types"
import { cn } from "@/lib/utils"

type CategoryManagerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onCreate: (input: { name: string; color: string }) => Promise<void>
  onUpdate: (id: string, patch: { name?: string; color?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CategoryManager({
  open,
  onOpenChange,
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0])
  const [busy, setBusy] = useState(false)

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      await onCreate({ name: trimmed, color })
      setName("")
      const nextColor =
        CATEGORY_COLORS[(categories.length + 1) % CATEGORY_COLORS.length]
      setColor(nextColor)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Tipos de lembrança</DialogTitle>
          <DialogDescription>
            Separe o céu como fizer sentido para você: faculdade, a fazeres,
            pendências, ou o que existir na sua cabeça.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <ul className="grid max-h-64 gap-2 overflow-y-auto pr-1">
            {categories.map((category) => (
              <CategoryRow
                key={`${category.id}-${category.name}`}
                category={category}
                canDelete={categories.length > 1}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </ul>
          <div className="grid gap-2 rounded-xl border border-dashed border-sky-300/80 bg-sky-50/60 p-3">
            <Label htmlFor="new-type">Novo tipo</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="new-type"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Trabalho"
                maxLength={40}
              />
              <Button
                onClick={() => void handleCreate()}
                disabled={busy || !name.trim()}
                className="bg-sky-700 text-white hover:bg-sky-800"
              >
                <Plus data-icon="inline-start" />
                Adicionar
              </Button>
            </div>
            <ColorSwatches value={color} onChange={setColor} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CategoryRow({
  category,
  canDelete,
  onUpdate,
  onDelete,
}: {
  category: Category
  canDelete: boolean
  onUpdate: (id: string, patch: { name?: string; color?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [name, setName] = useState(category.name)

  return (
    <li className="flex items-center gap-2 rounded-xl border border-border bg-white/80 p-2">
      <input
        type="color"
        value={category.color}
        onChange={(event) => void onUpdate(category.id, { color: event.target.value })}
        aria-label={`Cor de ${category.name}`}
        className="size-8 shrink-0 cursor-pointer rounded-full border border-black/10 bg-transparent p-0"
      />
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => {
          const trimmed = name.trim()
          if (!trimmed) {
            setName(category.name)
            return
          }
          if (trimmed !== category.name) {
            void onUpdate(category.id, { name: trimmed })
          }
        }}
        className="h-8 flex-1"
        maxLength={40}
      />
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={!canDelete}
        onClick={() => void onDelete(category.id)}
        aria-label={`Apagar ${category.name}`}
      >
        <Trash2 />
      </Button>
    </li>
  )
}

function ColorSwatches({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORY_COLORS.map((swatch) => (
        <button
          key={swatch}
          type="button"
          aria-label={`Cor ${swatch}`}
          onClick={() => onChange(swatch)}
          className={cn(
            "size-5 rounded-full ring-offset-2 transition-shadow",
            value === swatch ? "ring-2 ring-slate-800" : "ring-1 ring-black/10",
          )}
          style={{ background: swatch }}
        />
      ))}
    </div>
  )
}
