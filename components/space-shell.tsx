"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { SpaceWelcome } from "@/components/space-welcome"
import { SkyApp } from "@/components/sky-app"
import { readStoredSpaceId } from "@/lib/client-space"
import type { AppState } from "@/lib/types"

type BootPhase = "loading" | "welcome" | "ready"

export function SpaceShell() {
  const [phase, setPhase] = useState<BootPhase>("loading")
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [initialState, setInitialState] = useState<AppState | null>(null)

  useEffect(() => {
    const id = readStoredSpaceId()
    if (!id) {
      setPhase("welcome")
      return
    }
    void (async () => {
      try {
        const response = await fetch("/api/state", {
          headers: { "X-Space-Id": id },
          cache: "no-store",
        })
        if (!response.ok) {
          setPhase("welcome")
          return
        }
        const state = (await response.json()) as AppState
        setSpaceId(id)
        setInitialState(state)
        setPhase("ready")
      } catch {
        setPhase("welcome")
      }
    })()
  }, [])

  if (phase === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-sky-100 to-indigo-100">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="size-4 animate-spin" />
          Abrindo seu céu…
        </div>
      </main>
    )
  }

  if (phase === "welcome") {
    return (
      <SpaceWelcome
        onEnter={(id, state) => {
          setSpaceId(id)
          setInitialState(state)
          setPhase("ready")
        }}
      />
    )
  }

  if (!spaceId || !initialState) {
    return null
  }

  return <SkyApp spaceId={spaceId} initialState={initialState} />
}
