"use client"

import { useRef, useState } from "react"

import { MemoryBalloon } from "@/components/memory-balloon"
import { SkyBackdrop } from "@/components/sky-backdrop"
import type { Category, Memory } from "@/lib/types"

type SkyCanvasProps = {
  memories: Memory[]
  categories: Category[]
  activeCategoryId: string | "all"
  onMove: (id: string, x: number, y: number) => void
  onOpen: (id: string) => void
  onCreateAt: (x: number, y: number) => void
}

const DRAG_THRESHOLD = 6

export function SkyCanvas({
  memories,
  categories,
  activeCategoryId,
  onMove,
  onOpen,
  onCreateAt,
}: SkyCanvasProps) {
  const skyRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragRef = useRef<{
    id: string
    startX: number
    startY: number
    moved: boolean
    pointerId: number
  } | null>(null)

  function clientToRelative(clientX: number, clientY: number) {
    const rect = skyRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0.5, y: 0.42 }
    return {
      x: Math.min(0.94, Math.max(0.06, (clientX - rect.left) / rect.width)),
      y: Math.min(0.88, Math.max(0.1, (clientY - rect.top) / rect.height)),
    }
  }

  function onBalloonPointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    memory: Memory,
  ) {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      id: memory.id,
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
    setDraggingId(drag.id)
    const next = clientToRelative(event.clientX, event.clientY)
    onMove(drag.id, next.x, next.y)
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    if (event.pointerId !== drag.pointerId) return
    dragRef.current = null
    setDraggingId(null)
    if (!drag.moved) {
      onOpen(drag.id)
    }
  }

  function onSkyPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    if (event.button !== 0 && event.pointerType === "mouse") return
    const { x, y } = clientToRelative(event.clientX, event.clientY)
    onCreateAt(x, y)
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]))

  return (
    <div
      ref={skyRef}
      className="relative h-dvh w-full touch-none overflow-hidden"
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerDown={onSkyPointerDown}
    >
      <SkyBackdrop />
      {memories.map((memory) => (
        <MemoryBalloon
          key={memory.id}
          memory={memory}
          category={categoryById.get(memory.categoryId)}
          dimmed={
            activeCategoryId !== "all" && memory.categoryId !== activeCategoryId
          }
          dragging={draggingId === memory.id}
          onPointerDown={(event) => onBalloonPointerDown(event, memory)}
        />
      ))}
    </div>
  )
}
