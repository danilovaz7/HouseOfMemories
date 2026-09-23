"use client"

import { useIsMobile } from "@/hooks/use-is-mobile"
import type { Category, Memory } from "@/lib/types"

type BrainstormLinksProps = {
  categories: Category[]
  memories: Memory[]
  activeCategoryId: string | "all"
}

function linkPath(
  hubX: number,
  hubY: number,
  memoryX: number,
  memoryY: number,
) {
  const mx = (hubX + memoryX) / 2
  const my = (hubY + memoryY) / 2
  const dx = memoryX - hubX
  const dy = memoryY - hubY
  const cx = mx - dy * 0.12
  const cy = my + dx * 0.12
  return `M ${hubX * 100} ${hubY * 100} Q ${cx * 100} ${cy * 100} ${memoryX * 100} ${memoryY * 100}`
}

export function BrainstormLinks({
  categories,
  memories,
  activeCategoryId,
}: BrainstormLinksProps) {
  const isMobile = useIsMobile()
  const hubById = new Map(categories.map((category) => [category.id, category]))

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {memories.map((memory) => {
        const hub = hubById.get(memory.categoryId)
        if (!hub) return null
        const dimmed =
          activeCategoryId !== "all" && memory.categoryId !== activeCategoryId
        return (
          <path
            key={memory.id}
            d={linkPath(hub.x, hub.y, memory.x, memory.y)}
            fill="none"
            stroke={hub.color}
            strokeWidth={
              dimmed ? (isMobile ? 0.14 : 0.18) : isMobile ? 0.22 : 0.28
            }
            strokeOpacity={dimmed ? 0.12 : 0.38}
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}
