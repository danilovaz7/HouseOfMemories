export type Category = {
  id: string
  name: string
  color: string
  x: number
  y: number
}

export type Memory = {
  id: string
  title: string
  notes?: string
  categoryId: string
  x: number
  y: number
  createdAt: string
  updatedAt: string
}

export type AppState = {
  categories: Category[]
  memories: Memory[]
}

export const CATEGORY_COLORS = [
  "#38bdf8",
  "#f59e0b",
  "#fb7185",
  "#c084fc",
  "#34d399",
  "#fb923c",
  "#60a5fa",
  "#f472b6",
  "#a3e635",
  "#22d3ee",
] as const
