import { mutateState } from "@/lib/store"
import {
  ApiError,
  asRecord,
  jsonError,
  parseColor,
  parseName,
} from "@/lib/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = asRecord(await request.json())
    const name = parseName(body, false)
    const color = parseColor(body, false)

    const state = await mutateState((current) => {
      const category = current.categories.find((item) => item.id === id)
      if (!category) throw new ApiError(404, "Tipo não encontrado.")
      if (name) category.name = name
      if (color) category.color = color
      return current
    })

    return Response.json(state)
  } catch (error) {
    return jsonError(error)
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const state = await mutateState((current) => {
      if (current.categories.length <= 1) {
        throw new ApiError(400, "Mantenha pelo menos um tipo.")
      }
      const category = current.categories.find((item) => item.id === id)
      if (!category) throw new ApiError(404, "Tipo não encontrado.")
      const fallback = current.categories.find((item) => item.id !== id)!
      current.categories = current.categories.filter((item) => item.id !== id)
      current.memories = current.memories.map((memory) =>
        memory.categoryId === id
          ? {
              ...memory,
              categoryId: fallback.id,
              updatedAt: new Date().toISOString(),
            }
          : memory,
      )
      return current
    })
    return Response.json(state)
  } catch (error) {
    return jsonError(error)
  }
}
