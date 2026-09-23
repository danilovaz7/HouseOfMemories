import { parseSpaceId, SPACE_QUERY, SPACE_STORAGE_KEY } from "@/lib/space"

export function readStoredSpaceId(): string | null {
  if (typeof window === "undefined") return null
  const fromUrl = parseSpaceId(
    new URLSearchParams(window.location.search).get(SPACE_QUERY),
  )
  if (fromUrl) {
    window.localStorage.setItem(SPACE_STORAGE_KEY, fromUrl)
    return fromUrl
  }
  return parseSpaceId(window.localStorage.getItem(SPACE_STORAGE_KEY))
}

export function persistSpaceId(spaceId: string) {
  window.localStorage.setItem(SPACE_STORAGE_KEY, spaceId)
  const url = new URL(window.location.href)
  url.searchParams.set(SPACE_QUERY, spaceId)
  window.history.replaceState({}, "", url.toString())
}

export function buildSpaceUrl(spaceId: string) {
  const url = new URL(window.location.origin)
  url.searchParams.set(SPACE_QUERY, spaceId)
  return url.toString()
}

export function extractSpaceIdFromInput(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const asUrl = new URL(trimmed)
    const fromQuery = parseSpaceId(asUrl.searchParams.get(SPACE_QUERY))
    if (fromQuery) return fromQuery
  } catch {
    // not a URL
  }
  return parseSpaceId(trimmed)
}
