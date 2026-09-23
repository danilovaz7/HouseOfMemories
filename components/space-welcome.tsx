"use client"

import { useState } from "react"
import { Cloud, KeyRound, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  buildSpaceUrl,
  extractSpaceIdFromInput,
  persistSpaceId,
} from "@/lib/client-space"
import type { AppState } from "@/lib/types"

type SpaceWelcomeProps = {
  onEnter: (spaceId: string, state: AppState) => void
}

export function SpaceWelcome({ onEnter }: SpaceWelcomeProps) {
  const [linkInput, setLinkInput] = useState("")
  const [busy, setBusy] = useState<"create" | "open" | null>(null)

  async function createSpace() {
    setBusy("create")
    try {
      const response = await fetch("/api/spaces", { method: "POST" })
      if (!response.ok) {
        throw new Error("Não foi possível criar seu céu.")
      }
      const body = (await response.json()) as {
        spaceId: string
        state: AppState
      }
      persistSpaceId(body.spaceId)
      toast.success("Seu céu privado foi criado. Guarde o link com cuidado.")
      onEnter(body.spaceId, body.state)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao criar o céu.",
      )
    } finally {
      setBusy(null)
    }
  }

  async function openExisting() {
    const spaceId = extractSpaceIdFromInput(linkInput)
    if (!spaceId) {
      toast.error("Cole o link completo ou o código do seu céu.")
      return
    }
    setBusy("open")
    try {
      const response = await fetch("/api/state", {
        headers: { "X-Space-Id": spaceId },
        cache: "no-store",
      })
      if (!response.ok) {
        throw new Error("Não encontramos esse céu. Confira o link.")
      }
      const state = (await response.json()) as AppState
      persistSpaceId(spaceId)
      toast.success("Bem-vindo de volta ao seu céu.")
      onEnter(spaceId, state)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não deu para abrir o céu.",
      )
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-indigo-100 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(186,230,253,0.8),transparent_40%)]" />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/70 bg-white/60 p-8 shadow-[0_24px_80px_-32px_rgba(30,80,140,0.45)] backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg">
            <Cloud className="size-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
              House of Memories
            </h1>
            <p className="text-sm text-slate-600">Seu mapa mental, só seu.</p>
          </div>
        </div>
        <p className="mb-8 text-sm leading-relaxed text-slate-700">
          Sem login: cada pessoa recebe um{" "}
          <strong className="font-semibold text-slate-900">link secreto</strong>
          . Quem não tem o link não vê suas lembranças. Guarde esse endereço como
          se fosse uma senha — no celular e no computador.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="h-12 rounded-2xl bg-sky-700 text-base hover:bg-sky-800"
            disabled={busy !== null}
            onClick={() => void createSpace()}
          >
            <Sparkles data-icon="inline-start" />
            {busy === "create" ? "Criando seu céu…" : "Criar meu céu privado"}
          </Button>
          <div className="relative my-2 text-center text-xs uppercase tracking-wider text-slate-500">
            ou
          </div>
          <label className="text-xs font-medium text-slate-600">
            Já tenho meu link
          </label>
          <Input
            value={linkInput}
            onChange={(event) => setLinkInput(event.target.value)}
            placeholder="Cole o link ou o código UUID"
            className="rounded-xl border-white/80 bg-white/80"
          />
          <Button
            variant="outline"
            size="lg"
            className="h-11 rounded-2xl border-slate-200 bg-white/70"
            disabled={busy !== null}
            onClick={() => void openExisting()}
          >
            <KeyRound data-icon="inline-start" />
            {busy === "open" ? "Abrindo…" : "Entrar no meu céu"}
          </Button>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Depois de criar, use &quot;Copiar link&quot; no app para salvar em outro
          aparelho.
        </p>
      </div>
    </main>
  )
}

export function copySpaceLink(spaceId: string) {
  const url = buildSpaceUrl(spaceId)
  void navigator.clipboard.writeText(url).then(
    () => toast.success("Link do seu céu copiado."),
    () => toast.error("Não deu para copiar. Copie da barra de endereço."),
  )
}
