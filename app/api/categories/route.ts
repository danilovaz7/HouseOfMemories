import { findFreeCategoryHub } from "@/lib/layout"
import { requireSpaceId } from "@/lib/space"
import { mutateState } from "@/lib/store"
import { asRecord, jsonError, parseColor, parseName } from "@/lib/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = asRecord(await request.json())
    const name = parseName(body, true)!
    const color = parseColor(body, true)!

    const spaceId = requireSpaceId(request)
    const state = await mutateState(spaceId, (current) => {
      const hub = findFreeCategoryHub(current.categories, current.memories)
      current.categories.push({
        id: crypto.randomUUID(),
        name,
        color,
        x: hub.x,
        y: hub.y,
      })
      return current
    })

    return Response.json(state, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
