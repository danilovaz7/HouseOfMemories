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
  const floatX = ((seed % 9) - 4) * 1.4
  const floatY = 6 + (seed % 7)
  const duration = 4.4 + (seed % 10) * 0.22
  const delay = (seed % 16) * 0.12

  return (
    <div
      className={cn(
        "absolute z-10 w-[min(220px,46vw)]",
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
        initial={{ opacity: 0, scale: 0.72 }}
        animate={
          dragging
            ? { opacity: 1, scale: 1.06, x: 0, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                x: [0, floatX, 0, -floatX * 0.6, 0],
                y: [0, -floatY, -floatY * 0.4, -floatY, 0],
              }
        }
        transition={
          dragging
            ? { duration: 0.12 }
            : {
                opacity: { duration: 0.35 },
                scale: { type: "spring", stiffness: 280, damping: 20 },
                x: { duration, repeat: Infinity, ease: "easeInOut", delay },
                y: { duration, repeat: Infinity, ease: "easeInOut", delay },
              }
        }
      >
        <span
          className="relative block rounded-[2.6rem] px-4 py-4 text-slate-800 ring-1 ring-white/70"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.92) 0%, color-mix(in srgb, ${color} 42%, white) 100%)`,
            boxShadow: `0 18px 36px -16px color-mix(in srgb, ${color} 70%, #1e3a5f)`,
          }}
        >
          <span
            className="mb-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
            style={{
              background: `color-mix(in srgb, ${color} 28%, white)`,
              color: `color-mix(in srgb, ${color} 72%, #0f172a)`,
            }}
          >
            {category?.name ?? "Sem tipo"}
          </span>
          <span className="font-heading block text-[0.95rem] leading-snug font-semibold text-slate-800">
            {memory.title}
          </span>
          {memory.notes ? (
            <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-600">
              {memory.notes}
            </span>
          ) : null}
        </span>
        <span className="mx-auto mt-[-2px] block h-7 w-px bg-gradient-to-b from-slate-400/70 to-transparent" />
        <span
          className="mx-auto -mt-1 block size-2 rounded-full"
          style={{ background: color }}
        />
      </motion.button>
    </div>
  )
}
