"use client"

import { useRef, useState } from "react"

import { BrainstormLinks } from "@/components/brainstorm-links"
import { CategoryBalloon } from "@/components/category-balloon"
import { MemoryBalloon } from "@/components/memory-balloon"
import { SkyBackdrop } from "@/components/sky-backdrop"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { clampRelative } from "@/lib/layout"
import type { Category, Memory } from "@/lib/types"

type SkyCanvasProps = {
  memories: Memory[]
  categories: Category[]
  activeCategoryId: string | "all"
  onMoveMemory: (id: string, x: number, y: number) => void
  onMoveCategory: (id: string, x: number, y: number) => void
  onOpenMemory: (id: string) => void
  onOpenCategory: (id: string) => void
}

const DRAG_THRESHOLD = 6

type DragTarget =
  | { kind: "memory"; id: string }
  | { kind: "category"; id: string }

export function SkyCanvas({
  memories,
  categories,
  activeCategoryId,
  onMoveMemory,
  onMoveCategory,
  onOpenMemory,
  onOpenCategory,
}: SkyCanvasProps) {
  const isMobile = useIsMobile()
  const skyRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<DragTarget | null>(null)
  const dragRef = useRef<{
    target: DragTarget
    startX: number
    startY: number
    moved: boolean
    pointerId: number
  } | null>(null)

  function clientToRelative(clientX: number, clientY: number) {
    const rect = skyRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0.5, y: 0.42 }
    return clampRelative(
      (clientX - rect.left) / rect.width,
      (clientY - rect.top) / rect.height,
      isMobile,
    )
  }

  function startDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    target: DragTarget,
  ) {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      target,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      pointerId: event.pointerId,
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    const distance = Math.hypot(
      event.clientX - drag.startX,
      event.clientY - drag.startY,
    )
    if (!drag.moved && distance < DRAG_THRESHOLD) return
    drag.moved = true
    setDragging(drag.target)
    const next = clientToRelative(event.clientX, event.clientY)
    if (drag.target.kind === "memory") {
      onMoveMemory(drag.target.id, next.x, next.y)
    } else {
      onMoveCategory(drag.target.id, next.x, next.y)
    }
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    if (event.pointerId !== drag.pointerId) return
    dragRef.current = null
    setDragging(null)
    if (!drag.moved) {
      if (drag.target.kind === "memory") {
        onOpenMemory(drag.target.id)
      } else {
        onOpenCategory(drag.target.id)
      }
    }
  }

  const counts = new Map<string, number>()
  for (const memory of memories) {
    counts.set(memory.categoryId, (counts.get(memory.categoryId) ?? 0) + 1)
  }

  function isDimmed(categoryId: string) {
    return activeCategoryId !== "all" && categoryId !== activeCategoryId
  }

  function hideOnMobile(categoryId: string) {
    return isMobile && activeCategoryId !== "all" && categoryId !== activeCategoryId
  }

  return (
    <div
      ref={skyRef}
      className="relative h-dvh w-full touch-none overflow-hidden"
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="absolute inset-x-0 top-0 bottom-0 max-md:bottom-[8.75rem]">
        <SkyBackdrop />
        <BrainstormLinks
          categories={categories}
          memories={memories.filter(
            (memory) => !hideOnMobile(memory.categoryId),
          )}
          activeCategoryId={activeCategoryId}
        />
        {categories.map((category) => (
          <CategoryBalloon
            key={category.id}
            category={category}
            memoryCount={counts.get(category.id) ?? 0}
            compact={isMobile}
            dimmed={isDimmed(category.id)}
            hiddenOnMobile={hideOnMobile(category.id)}
            dragging={
              dragging?.kind === "category" && dragging.id === category.id
            }
            onPointerDown={(event) =>
              startDrag(event, { kind: "category", id: category.id })
            }
          />
        ))}
        {memories.map((memory) => {
          const category = categories.find(
            (item) => item.id === memory.categoryId,
          )
          return (
            <MemoryBalloon
              key={memory.id}
              memory={memory}
              category={category}
              compact={isMobile}
              dimmed={isDimmed(memory.categoryId)}
              hiddenOnMobile={hideOnMobile(memory.categoryId)}
              dragging={
                dragging?.kind === "memory" && dragging.id === memory.id
              }
              onPointerDown={(event) =>
                startDrag(event, { kind: "memory", id: memory.id })
              }
            />
          )
        })}
      </div>
    </div>
  )
}
