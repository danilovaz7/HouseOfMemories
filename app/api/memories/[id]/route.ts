import { requireSpaceId } from "@/lib/space"
import { mutateState } from "@/lib/store"
import {
  asRecord,
  jsonError,
  parseNotes,
  parsePosition,
  parseTitle,
  requireCategory,
  requireMemory,
} from "@/lib/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = asRecord(await request.json())
    const title = parseTitle(body, false)
    const notes = parseNotes(body)
    const { x, y } = parsePosition(body)
    const categoryId =
      typeof body.categoryId === "string" ? body.categoryId : undefined

    const spaceId = requireSpaceId(request)
    const state = await mutateState(spaceId, (current) => {
      const memory = requireMemory(current.memories, id)
      if (categoryId) requireCategory(current.categories, categoryId)
      if (title !== undefined) memory.title = title
      if (notes !== undefined) memory.notes = notes || undefined
      if (categoryId) memory.categoryId = categoryId
      if (x !== undefined) memory.x = x
      if (y !== undefined) memory.y = y
      memory.updatedAt = new Date().toISOString()
      return current
    })

    return Response.json(state)
  } catch (error) {
    return jsonError(error)
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const spaceId = requireSpaceId(request)
    const state = await mutateState(spaceId, (current) => {
      requireMemory(current.memories, id)
      current.memories = current.memories.filter((memory) => memory.id !== id)
      return current
    })
    return Response.json(state)
  } catch (error) {
    return jsonError(error)
  }
}
