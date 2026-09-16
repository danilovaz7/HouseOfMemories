import type { Metadata } from "next"
import { Fraunces, Nunito } from "next/font/google"

import { Providers } from "@/components/providers"

import "./globals.css"

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Céu de Lembranças",
  description:
    "Um mapa mental no céu: solte balões do que você não quer esquecer que existe.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
