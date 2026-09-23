"use client"

import { motion } from "framer-motion"

import { hashSeed } from "@/lib/layout"
import type { Category, Memory } from "@/lib/types"
import { cn } from "@/lib/utils"

type MemoryBalloonProps = {
  memory: Memory
  category?: Category
  dimmed?: boolean
  dragging?: boolean
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void
}

export function MemoryBalloon({
  memory,
  category,
  dimmed,
  dragging,
  onPointerDown,
}: MemoryBalloonProps) {
  const color = category?.color ?? "#38bdf8"
  const seed = hashSeed(memory.id)
  const floatX = ((seed % 9) - 4) * 1.1
  const floatY = 5 + (seed % 6)
  const duration = 4.8 + (seed % 10) * 0.2
  const delay = (seed % 16) * 0.1

  return (
    <div
      className={cn(
        "absolute z-10 w-[min(190px,42vw)]",
        dragging && "z-30",
        dimmed && "opacity-35",
      )}
      style={{
        left: `${memory.x * 100}%`,
        top: `${memory.y * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.button
        type="button"
        aria-label={memory.title}
        onPointerDown={onPointerDown}
        className={cn(
          "block w-full origin-center touch-none select-none text-left",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        initial={false}
        animate={
          dragging
            ? { opacity: 1, scale: 1.05, x: 0, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                x: [0, floatX, 0, -floatX * 0.5, 0],
                y: [0, -floatY, -floatY * 0.35, -floatY, 0],
              }
        }
        transition={
          dragging
            ? { duration: 0.12 }
            : {
                x: { duration, repeat: Infinity, ease: "easeInOut", delay },
                y: { duration, repeat: Infinity, ease: "easeInOut", delay },
              }
        }
      >
        <span
          className="relative block rounded-[2rem] rounded-bl-md px-3.5 py-3 text-slate-800 ring-1 ring-white/75 backdrop-blur-[2px]"
          style={{
            background: `linear-gradient(145deg, rgba(255,255,255,0.94) 0%, color-mix(in srgb, ${color} 32%, white) 100%)`,
            boxShadow: `0 14px 28px -14px color-mix(in srgb, ${color} 65%, #1e3a5f)`,
          }}
        >
          <span className="font-heading block text-[0.88rem] leading-snug font-semibold text-slate-800">
            {memory.title}
          </span>
          {memory.notes ? (
            <span className="mt-1 line-clamp-2 block text-[11px] leading-relaxed text-slate-600">
              {memory.notes}
            </span>
          ) : null}
        </span>
      </motion.button>
    </div>
  )
}
