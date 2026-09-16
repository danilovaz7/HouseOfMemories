"use client"

import { useMemo, useState } from "react"
import { CloudOff, RefreshCw } from "lucide-react"

import { CategoryManager } from "@/components/category-manager"
import {
  MemorySheet,
  memoryToDraft,
  type MemoryDraft,
} from "@/components/memory-sheet"
import { SkyCanvas } from "@/components/sky-canvas"
import { Toolbar } from "@/components/toolbar"
import { Button } from "@/components/ui/button"
import { useSky } from "@/hooks/use-sky"
import { findFreePosition } from "@/lib/layout"
import type { AppState } from "@/lib/types"

export function SkyApp({ initialState }: { initialState: AppState }) {
  const sky = useSky(initialState)
  const [filter, setFilter] = useState<string | "all">("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [typesOpen, setTypesOpen] = useState(false)
  const [draft, setDraft] = useState<MemoryDraft | null>(null)

  const categories = sky.state.categories
  const memories = sky.state.memories

  const matchCount = useMemo(() => {
    if (filter === "all") return memories.length
    return memories.filter((memory) => memory.categoryId === filter).length
  }, [filter, memories])

  function openCreate(position?: { x: number; y: number }) {
    const fallback = categories[0]
    if (!fallback) {
      setTypesOpen(true)
      return
    }
    const spot = position ?? findFreePosition(memories)
    setDraft({
      title: "",
      notes: "",
      categoryId: filter === "all" ? fallback.id : filter,
      x: spot.x,
      y: spot.y,
    })
    setSheetOpen(true)
  }

  function openExisting(id: string) {
    const memory = memories.find((item) => item.id === id)
    if (!memory) return
    setDraft(memoryToDraft(memory))
    setSheetOpen(true)
  }

  async function saveDraft(next: MemoryDraft) {
    if (next.id) {
      await sky.updateMemory(next.id, {
        title: next.title,
        notes: next.notes,
        categoryId: next.categoryId,
      })
      return
    }
    await sky.createMemory({
      title: next.title,
      notes: next.notes,
      categoryId: next.categoryId,
      x: next.x,
      y: next.y,
    })
  }

  return (
    <div className="relative min-h-dvh">
      <SkyCanvas
        memories={memories}
        categories={categories}
        activeCategoryId={filter}
        onMove={sky.moveMemory}
        onOpen={openExisting}
        onCreateAt={(x, y) => openCreate({ x, y })}
      />

      <Toolbar
        categories={categories}
        activeCategoryId={filter}
        onFilter={setFilter}
        onAdd={() => openCreate()}
        onManageTypes={() => setTypesOpen(true)}
      />

      {sky.status === "error" ? (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-40 flex justify-center px-3 max-md:top-auto max-md:bottom-28">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-3 py-2 text-sm text-rose-700 shadow-lg backdrop-blur-xl">
            <CloudOff className="size-4" />
            Sem conexão com o céu.
            <Button size="sm" variant="ghost" onClick={() => void sky.load()}>
              <RefreshCw data-icon="inline-start" />
              Tentar de novo
            </Button>
          </div>
        </div>
      ) : null}

      {memories.length === 0 ? (
        <StatusCard className="pointer-events-none">
          <p className="font-heading text-lg font-semibold">Céu calmo</p>
          <p className="max-w-xs text-sm text-slate-600">
            Solte a primeira lembrança neste céu. Clique no vazio ou use o botão
            acima para um novo balão.
          </p>
        </StatusCard>
      ) : null}

      {memories.length > 0 && matchCount === 0 ? (
        <StatusCard className="pointer-events-none">
          <p className="font-heading text-sm font-semibold">
            Nada neste tipo por enquanto
          </p>
          <p className="text-xs text-slate-600">
            Os outros balões ficam mais suaves. Solte uma nova lembrança neste
            tipo ou volte para Todos.
          </p>
        </StatusCard>
      ) : null}

      <p className="pointer-events-none fixed bottom-4 left-1/2 z-30 hidden -translate-x-1/2 text-xs text-slate-600/80 md:block max-md:hidden">
        Arraste os balões. Clique no céu para soltar uma lembrança.
      </p>

      <MemorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        draft={draft}
        categories={categories}
        onSave={saveDraft}
        onDelete={sky.deleteMemory}
      />

      <CategoryManager
        open={typesOpen}
        onOpenChange={setTypesOpen}
        categories={categories}
        onCreate={sky.createCategory}
        onUpdate={sky.updateCategory}
        onDelete={sky.deleteCategory}
      />
    </div>
  )
}

function StatusCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4">
      <div
        className={`pointer-events-auto flex flex-col items-center gap-2 rounded-3xl border border-white/70 bg-white/70 px-6 py-5 text-center shadow-[0_20px_50px_-24px_rgba(30,80,140,0.45)] backdrop-blur-xl ${className ?? ""}`}
      >
        {children}
      </div>
    </div>
  )
}
