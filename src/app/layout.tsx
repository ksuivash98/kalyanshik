import type { Metadata, Viewport } from "next"
import { Manrope, JetBrains_Mono } from "next/font/google"
import { AppNav } from "@/components/layout/app-nav"
import { PwaRegister } from "@/components/layout/pwa-register"
import { AppStoreProvider } from "@/components/providers/app-store-provider"
import "./globals.css"

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
})

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export const metadata: Metadata = {
  applicationName: "Hookah Mix",
  title: {
    default: "Hookah Mix",
    template: "%s · Hookah Mix",
  },
  description:
    "Веб-приложение для коллекции табаков и подбора кальянных миксов по вкусу, крепости и холоду",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hookah Mix",
  },
  icons: {
    icon: [{ url: `${basePath}/icons/icon.svg`, type: "image/svg+xml" }],
    apple: [{ url: `${basePath}/icons/apple-touch-icon.png` }],
  },
}

export const viewport: Viewport = {
  themeColor: "#0c0a09",
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
        <AppStoreProvider>
          <PwaRegister />
          <AppNav />
          <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 md:pb-12">{children}</main>
        </AppStoreProvider>
      </body>
    </html>
  )
}
