import { CATEGORY_COLORS, type Category, type Memory } from "@/lib/types"

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  console.error(error)
  return Response.json({ error: "Erro interno." }, { status: 500 })
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new ApiError(400, "JSON inválido.")
  }
  return value as Record<string, unknown>
}

export function readString(record: Record<string, unknown>, key: string) {
  const value = record[key]
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

export function readOptionalString(record: Record<string, unknown>, key: string) {
  const value = record[key]
  if (value === undefined || value === null) return undefined
  if (typeof value !== "string") {
    throw new ApiError(400, `Campo ${key} inválido.`)
  }
  return value.trim()
}

export function readNumber(record: Record<string, unknown>, key: string) {
  const value = record[key]
  if (typeof value !== "number" || Number.isNaN(value)) return undefined
  return value
}

export function parseTitle(record: Record<string, unknown>, required: boolean) {
  const title = readString(record, "title")
  if (!title) {
    if (required) throw new ApiError(400, "Título é obrigatório.")
    return undefined
  }
  if (title.length > 120) {
    throw new ApiError(400, "Título pode ter no máximo 120 caracteres.")
  }
  return title
}

export function parseNotes(record: Record<string, unknown>) {
  if (!("notes" in record)) return undefined
  const notes = readOptionalString(record, "notes")
  if (notes && notes.length > 2000) {
    throw new ApiError(400, "Notas podem ter no máximo 2000 caracteres.")
  }
  return notes ?? ""
}

export function parsePosition(record: Record<string, unknown>) {
  const x = readNumber(record, "x")
  const y = readNumber(record, "y")
  return {
    x: x === undefined ? undefined : clamp(x, 0.06, 0.94),
    y: y === undefined ? undefined : clamp(y, 0.1, 0.88),
  }
}

export function parseColor(record: Record<string, unknown>, required: boolean) {
  const color = readString(record, "color")
  if (!color) {
    if (required) return CATEGORY_COLORS[0]
    return undefined
  }
  if (!/^#([0-9a-fA-F]{6})$/.test(color)) {
    throw new ApiError(400, "Cor inválida. Use um hex como #38bdf8.")
  }
  return color.toLowerCase()
}

export function parseName(record: Record<string, unknown>, required: boolean) {
  const name = readString(record, "name")
  if (!name) {
    if (required) throw new ApiError(400, "Nome do tipo é obrigatório.")
    return undefined
  }
  if (name.length > 40) {
    throw new ApiError(400, "Nome do tipo pode ter no máximo 40 caracteres.")
  }
  return name
}

export function requireCategory(categories: Category[], categoryId: string) {
  const category = categories.find((item) => item.id === categoryId)
  if (!category) {
    throw new ApiError(400, "Tipo não encontrado.")
  }
  return category
}

export function requireMemory(memories: Memory[], id: string) {
  const memory = memories.find((item) => item.id === id)
  if (!memory) {
    throw new ApiError(404, "Lembrança não encontrada.")
  }
  return memory
}
