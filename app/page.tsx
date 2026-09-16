import { SkyApp } from "@/components/sky-app"
import { getState } from "@/lib/store"

export const dynamic = "force-dynamic"

export default async function Home() {
  const initialState = await getState()
  return <SkyApp initialState={initialState} />
}
