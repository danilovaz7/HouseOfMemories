"use client"

import { motion } from "framer-motion"

import { hashSeed } from "@/lib/layout"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

type CategoryBalloonProps = {
  category: Category
  memoryCount: number
  dimmed?: boolean
  dragging?: boolean
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void
}

export function CategoryBalloon({
  category,
  memoryCount,
  dimmed,
  dragging,
  onPointerDown,
}: CategoryBalloonProps) {
  const seed = hashSeed(category.id)
  const floatX = ((seed % 7) - 3) * 0.8
  const floatY = 4 + (seed % 5)
  const duration = 5.2 + (seed % 8) * 0.25

  return (
    <div
      className={cn(
        "absolute z-[8] w-[min(168px,38vw)]",
        dragging && "z-30",
        dimmed && "opacity-35",
      )}
      style={{
        left: `${category.x * 100}%`,
        top: `${category.y * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.button
        type="button"
        aria-label={`Tipo ${category.name}`}
        onPointerDown={onPointerDown}
        className={cn(
          "block w-full origin-center touch-none select-none text-center",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        initial={false}
        animate={
          dragging
            ? { opacity: 1, scale: 1.05, x: 0, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                x: [0, floatX, 0],
                y: [0, -floatY, 0],
              }
        }
        transition={
          dragging
            ? { duration: 0.12 }
            : {
                x: { duration, repeat: Infinity, ease: "easeInOut" },
                y: { duration, repeat: Infinity, ease: "easeInOut" },
              }
        }
      >
        <span
          className="relative block rounded-full px-5 py-4 font-heading text-base font-semibold text-slate-900 ring-2 ring-white/80"
          style={{
            background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.95), color-mix(in srgb, ${category.color} 55%, white))`,
            boxShadow: `0 22px 44px -18px color-mix(in srgb, ${category.color} 75%, #1e3a5f)`,
          }}
        >
          {category.name}
          <span className="mt-1 block text-[10px] font-medium tracking-wide text-slate-700/80 uppercase">
            {memoryCount === 1
              ? "1 nuvem"
              : `${memoryCount} nuvens`}
          </span>
        </span>
        <span className="mx-auto mt-1 block h-8 w-px bg-gradient-to-b from-slate-500/50 to-transparent" />
        <span
          className="mx-auto -mt-1 block size-3 rounded-full ring-2 ring-white/90"
          style={{ background: category.color }}
        />
      </motion.button>
    </div>
  )
}
