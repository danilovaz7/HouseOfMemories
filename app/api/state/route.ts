import { requireSpaceId } from "@/lib/space"
import { getState, putState } from "@/lib/store"
import { asRecord, jsonError } from "@/lib/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const spaceId = requireSpaceId(request)
    const state = await getState(spaceId)
    return Response.json(state)
  } catch (error) {
    return jsonError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const spaceId = requireSpaceId(request)
    const body = asRecord(await request.json())
    const state = await putState(spaceId, {
      categories: Array.isArray(body.categories) ? body.categories : [],
      memories: Array.isArray(body.memories) ? body.memories : [],
    })
    return Response.json(state)
  } catch (error) {
    return jsonError(error)
  }
}
