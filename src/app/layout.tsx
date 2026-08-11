import type { Metadata } from "next"
import { Manrope, JetBrains_Mono } from "next/font/google"
import { AppNav } from "@/components/layout/app-nav"
import "./globals.css"

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
})

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Hookah Mix — помощник кальянщика",
  description:
    "Коллекция табаков, каталог вкусов и умный подбор миксов по вкусовому профилю",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <AppNav />
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 md:pb-12">{children}</main>
      </body>
    </html>
  )
}
