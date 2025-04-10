import type React from "react"

export const metadata = {
  title: "Спектральный анализ | Планировщик лунной базы",
  description: "Подробная информация о спектральном анализе поверхности Луны для планирования лунной базы",
}

export default function SpectralAnalysisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

