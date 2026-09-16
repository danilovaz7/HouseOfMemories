"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { findFreePosition } from "@/lib/layout"
import type { AppState, Category, Memory } from "@/lib/types"

type Status = "ready" | "error"

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string }
    return body.error || "Não foi possível falar com o céu."
  } catch {
    return "Não foi possível falar com o céu."
  }
}

async function requestState(
  url: string,
  init?: RequestInit,
): Promise<AppState> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return (await response.json()) as AppState
}

export function useSky(initialState: AppState) {
  const [state, setState] = useState<AppState>(initialState)
  const [status, setStatus] = useState<Status>("ready")
  const timers = useRef(new Map<string, number>())

  const apply = useCallback((next: AppState) => {
    setState(next)
    setStatus("ready")
  }, [])

  const load = useCallback(async () => {
    try {
      const next = await requestState("/api/state")
      apply(next)
    } catch {
      setStatus("error")
    }
  }, [apply])

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const createMemory = useCallback(
    async (input: {
      title: string
      notes?: string
      categoryId: string
      x?: number
      y?: number
    }) => {
      const position =
        input.x !== undefined && input.y !== undefined
          ? { x: input.x, y: input.y }
          : findFreePosition(state.memories)
      const optimistic: Memory = {
        id: `tmp-${crypto.randomUUID()}`,
        title: input.title,
        notes: input.notes,
        categoryId: input.categoryId,
        x: position.x,
        y: position.y,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setState((current) => ({
        ...current,
        memories: [...current.memories, optimistic],
      }))
      try {
        const next = await requestState("/api/memories", {
          method: "POST",
          body: JSON.stringify({ ...input, ...position }),
        })
        apply(next)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao criar.")
        await load()
        throw error
      }
    },
    [apply, load, state.memories],
  )

  const updateMemory = useCallback(
    async (
      id: string,
      patch: Partial<Pick<Memory, "title" | "notes" | "categoryId" | "x" | "y">>,
    ) => {
      setState((current) => ({
        ...current,
        memories: current.memories.map((memory) =>
          memory.id === id
            ? { ...memory, ...patch, updatedAt: new Date().toISOString() }
            : memory,
        ),
      }))
      try {
        const next = await requestState(`/api/memories/${id}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        })
        apply(next)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao salvar.")
        await load()
        throw error
      }
    },
    [apply, load],
  )

  const moveMemory = useCallback(
    (id: string, x: number, y: number) => {
      setState((current) => ({
        ...current,
        memories: current.memories.map((memory) =>
          memory.id === id ? { ...memory, x, y } : memory,
        ),
      }))
      const existing = timers.current.get(id)
      if (existing) window.clearTimeout(existing)
      const timer = window.setTimeout(() => {
        timers.current.delete(id)
        void (async () => {
          try {
            const next = await requestState(`/api/memories/${id}`, {
              method: "PATCH",
              body: JSON.stringify({ x, y }),
            })
            apply(next)
          } catch {
            toast.error("Não deu para guardar a posição. Tentando de novo…")
            void load()
          }
        })()
      }, 380)
      timers.current.set(id, timer)
    },
    [apply, load],
  )

  const deleteMemory = useCallback(
    async (id: string) => {
      setState((current) => ({
        ...current,
        memories: current.memories.filter((memory) => memory.id !== id),
      }))
      try {
        const next = await requestState(`/api/memories/${id}`, {
          method: "DELETE",
        })
        apply(next)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao apagar.")
        await load()
        throw error
      }
    },
    [apply, load],
  )

  const createCategory = useCallback(
    async (input: { name: string; color: string }) => {
      try {
        const next = await requestState("/api/categories", {
          method: "POST",
          body: JSON.stringify(input),
        })
        apply(next)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao criar tipo.")
        throw error
      }
    },
    [apply],
  )

  const updateCategory = useCallback(
    async (id: string, patch: Partial<Pick<Category, "name" | "color">>) => {
      setState((current) => ({
        ...current,
        categories: current.categories.map((category) =>
          category.id === id ? { ...category, ...patch } : category,
        ),
      }))
      try {
        const next = await requestState(`/api/categories/${id}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        })
        apply(next)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao editar tipo.")
        await load()
        throw error
      }
    },
    [apply, load],
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        const next = await requestState(`/api/categories/${id}`, {
          method: "DELETE",
        })
        apply(next)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao apagar tipo.")
        throw error
      }
    },
    [apply],
  )

  return {
    state,
    status,
    load,
    createMemory,
    updateMemory,
    moveMemory,
    deleteMemory,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
