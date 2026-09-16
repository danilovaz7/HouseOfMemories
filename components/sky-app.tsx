"use client"

import { useMemo, useState } from "react"
import { CloudOff, Loader2, RefreshCw } from "lucide-react"

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

export function SkyApp() {
  const sky = useSky()
  const [filter, setFilter] = useState<string | "all">("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [typesOpen, setTypesOpen] = useState(false)
  const [draft, setDraft] = useState<MemoryDraft | null>(null)

  const categories = sky.state?.categories ?? []
  const memories = sky.state?.memories ?? []

  const matchCount = useMemo(() => {
    const list = sky.state?.memories ?? []
    if (filter === "all") return list.length
    return list.filter((memory) => memory.categoryId === filter).length
  }, [filter, sky.state?.memories])

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

      {sky.status === "loading" ? (
        <StatusCard>
          <Loader2 className="size-5 animate-spin text-sky-700" />
          <p className="font-heading text-sm font-semibold">Carregando o céu…</p>
          <p className="text-xs text-slate-600">Buscando suas lembranças.</p>
        </StatusCard>
      ) : null}

      {sky.status === "error" ? (
        <StatusCard>
          <CloudOff className="size-5 text-rose-500" />
          <p className="font-heading text-sm font-semibold">
            O céu não respondeu
          </p>
          <p className="text-xs text-slate-600">
            Não deu para carregar as lembranças. Tente de novo.
          </p>
          <Button size="sm" className="mt-1" onClick={() => void sky.load()}>
            <RefreshCw data-icon="inline-start" />
            Tentar novamente
          </Button>
        </StatusCard>
      ) : null}

      {sky.status === "ready" && memories.length === 0 ? (
        <StatusCard className="pointer-events-none">
          <p className="font-heading text-lg font-semibold">Céu calmo</p>
          <p className="max-w-xs text-sm text-slate-600">
            Solte a primeira lembrança neste céu. Clique no vazio ou use o botão
            acima para um novo balão.
          </p>
        </StatusCard>
      ) : null}

      {sky.status === "ready" && memories.length > 0 && matchCount === 0 ? (
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
