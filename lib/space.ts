import { randomUUID } from "node:crypto"

import { ApiError } from "@/lib/validation"

export const SPACE_COOKIE = "hom-space"
export const SPACE_STORAGE_KEY = "hom-space-id"
export const SPACE_QUERY = "s"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function parseSpaceId(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!UUID_RE.test(trimmed)) return null
  return trimmed.toLowerCase()
}

export function createSpaceId() {
  return randomUUID().toLowerCase()
}

export function readSpaceIdFromRequest(request: Request): string | null {
  const header = parseSpaceId(request.headers.get("x-space-id"))
  if (header) return header

  const cookieHeader = request.headers.get("cookie")
  if (!cookieHeader) return null
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${SPACE_COOKIE}=([^;]+)`),
  )
  return parseSpaceId(match?.[1] ? decodeURIComponent(match[1]) : null)
}

export function requireSpaceId(request: Request): string {
  const spaceId = readSpaceIdFromRequest(request)
  if (!spaceId) {
    throw new ApiError(401, "Seu céu privado não foi identificado.")
  }
  return spaceId
}

export function spaceCookieHeader(spaceId: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${SPACE_COOKIE}=${spaceId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=315360000${secure}`
}

export function storageKeyForSpace(spaceId: string) {
  return `house-of-memories:space:${spaceId}`
}
