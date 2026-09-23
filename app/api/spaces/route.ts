import { createSpaceId, spaceCookieHeader } from "@/lib/space"
import { createSpaceState } from "@/lib/store"
import { jsonError } from "@/lib/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const spaceId = createSpaceId()
    const state = await createSpaceState(spaceId)
    return Response.json(
      { spaceId, state },
      {
        status: 201,
        headers: {
          "Set-Cookie": spaceCookieHeader(spaceId),
        },
      },
    )
  } catch (error) {
    return jsonError(error)
  }
}
