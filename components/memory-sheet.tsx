"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useIsMobile } from "@/hooks/use-is-mobile"
import type { Category, Memory } from "@/lib/types"
import { cn } from "@/lib/utils"

export type MemoryDraft = {
  id?: string
  title: string
  notes: string
  categoryId: string
  x?: number
  y?: number
}

type MemorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: MemoryDraft | null
  categories: Category[]
  onSave: (draft: MemoryDraft) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function MemorySheet({
  open,
  onOpenChange,
  draft,
  categories,
  onSave,
  onDelete,
}: MemorySheetProps) {
  const isMobile = useIsMobile()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="bg-white/95 backdrop-blur-xl"
      >
        {draft ? (
          <MemoryForm
            key={`${draft.id ?? "new"}-${draft.x ?? 0}-${draft.y ?? 0}`}
            draft={draft}
            categories={categories}
            onOpenChange={onOpenChange}
            onSave={onSave}
            onDelete={onDelete}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function MemoryForm({
  draft,
  categories,
  onOpenChange,
  onSave,
  onDelete,
}: {
  draft: MemoryDraft
  categories: Category[]
  onOpenChange: (open: boolean) => void
  onSave: (draft: MemoryDraft) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}) {
  const [title, setTitle] = useState(draft.title)
  const [notes, setNotes] = useState(draft.notes)
  const [categoryId, setCategoryId] = useState(draft.categoryId)
  const [saving, setSaving] = useState(false)
  const isEditing = Boolean(draft.id && !draft.id.startsWith("tmp-"))

  async function handleSave() {
    const trimmed = title.trim()
    if (!trimmed || !categoryId) return
    setSaving(true)
    try {
      await onSave({
        ...draft,
        title: trimmed,
        notes: notes.trim(),
        categoryId,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!draft.id || !onDelete) return
    setSaving(true)
    try {
      await onDelete(draft.id)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-heading">
          {isEditing ? "Abrir lembrança" : "Soltar uma lembrança"}
        </SheetTitle>
        <SheetDescription>
          Escreva o que você não quer esquecer. A nuvem fica ligada ao balão
          do tipo escolhido — arraste para organizar o brainstorm.
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
        <div className="grid gap-2">
          <Label htmlFor="memory-title">Título</Label>
          <Input
            id="memory-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Entregar o relatório"
            maxLength={120}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="memory-notes">Notas</Label>
          <Textarea
            id="memory-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Detalhes opcionais, prazos, o porquê disso existir…"
            maxLength={2000}
            className="min-h-28"
          />
        </div>
        <div className="grid gap-2">
          <Label>Tipo</Label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  categoryId === category.id
                    ? "border-slate-800 bg-slate-800 text-white"
                    : "border-border bg-white text-slate-700 hover:bg-slate-50",
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: category.color }}
                />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <SheetFooter className="flex-row flex-wrap justify-between gap-2">
        {isEditing && draft.id ? (
          <Button
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={saving}
          >
            <Trash2 data-icon="inline-start" />
            Apagar
          </Button>
        ) : (
          <span />
        )}
        <Button
          onClick={() => void handleSave()}
          disabled={saving || !title.trim() || !categoryId}
          className="bg-sky-700 text-white hover:bg-sky-800"
        >
          {isEditing ? "Guardar" : "Soltar no céu"}
        </Button>
      </SheetFooter>
    </>
  )
}

export function memoryToDraft(memory: Memory): MemoryDraft {
  return {
    id: memory.id,
    title: memory.title,
    notes: memory.notes ?? "",
    categoryId: memory.categoryId,
    x: memory.x,
    y: memory.y,
  }
}
