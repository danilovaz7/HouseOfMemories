import { requireSpaceId } from "@/lib/space"
import { mutateState } from "@/lib/store"
import {
  ApiError,
  asRecord,
  jsonError,
  parseNotes,
  parsePosition,
  parseTitle,
  requireCategory,
} from "@/lib/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = asRecord(await request.json())
    const title = parseTitle(body, true)!
    const notes = parseNotes(body)
    const { x, y } = parsePosition(body)
    const categoryId =
      typeof body.categoryId === "string" ? body.categoryId : undefined

    const spaceId = requireSpaceId(request)
    const state = await mutateState(spaceId, (current) => {
      if (!categoryId) {
        throw new ApiError(400, "Tipo é obrigatório.")
      }
      requireCategory(current.categories, categoryId)
      const now = new Date().toISOString()
      current.memories.push({
        id: crypto.randomUUID(),
        title,
        notes: notes || undefined,
        categoryId,
        x: x ?? 0.5,
        y: y ?? 0.42,
        createdAt: now,
        updatedAt: now,
      })
      return current
    })

    return Response.json(state, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
