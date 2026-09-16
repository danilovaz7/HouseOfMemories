import { getState, putState } from "@/lib/store"
import { asRecord, jsonError } from "@/lib/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const state = await getState()
    return Response.json(state)
  } catch (error) {
    return jsonError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const body = asRecord(await request.json())
    const state = await putState({
      categories: Array.isArray(body.categories) ? body.categories : [],
      memories: Array.isArray(body.memories) ? body.memories : [],
    })
    return Response.json(state)
  } catch (error) {
    return jsonError(error)
  }
}
