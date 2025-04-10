import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata = {
  title: "Планировщик лунной базы",
  description: "Создайте свою лунную базу на Южном полюсе Луны!",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  )
}



import './globals.css'