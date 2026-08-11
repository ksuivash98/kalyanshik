import type { Metadata, Viewport } from "next"
import { Manrope, JetBrains_Mono } from "next/font/google"
import { AppNav } from "@/components/layout/app-nav"
import { PwaRegister } from "@/components/layout/pwa-register"
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
  applicationName: "Hookah Mix",
  title: {
    default: "Hookah Mix",
    template: "%s · Hookah Mix",
  },
  description:
    "Веб-приложение для коллекции табаков и подбора кальянных миксов по вкусу, крепости и холоду",
  keywords: ["кальян", "микс", "табак", "hookah", "миксмейкер"],
  authors: [{ name: "Hookah Mix" }],
  creator: "Hookah Mix",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hookah Mix",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Hookah Mix",
    title: "Hookah Mix — помощник кальянщика",
    description:
      "Коллекция табаков, каталог вкусов и умный подбор миксов по вкусовому профилю",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
    { media: "(prefers-color-scheme: light)", color: "#0c0a09" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <PwaRegister />
        <AppNav />
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 md:pb-12">{children}</main>
      </body>
    </html>
  )
}
