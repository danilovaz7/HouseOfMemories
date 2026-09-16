import { mutateState } from "@/lib/store"
import { asRecord, jsonError, parseColor, parseName } from "@/lib/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = asRecord(await request.json())
    const name = parseName(body, true)!
    const color = parseColor(body, true)!

    const state = await mutateState((current) => {
      current.categories.push({
        id: crypto.randomUUID(),
        name,
        color,
      })
      return current
    })

    return Response.json(state, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
