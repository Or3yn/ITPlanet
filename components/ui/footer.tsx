"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Github, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function Footer() {
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const dialogs = {
    terms: {
      title: "Условия использования",
      content: (
        <div className="space-y-4">
          <p>Проект ITPlanet - это веб-решение для планирования строительства лунной базы на Южном полюсе Луны.</p>
          <p>© 2025 ITPlanet 3Dev. Все права защищены.</p>
          <p>Версия: 1.0.0</p>
        </div>
      )
    },
    privacy: {
      title: "Политика конфиденциальности",
      content: (
        <div className="space-y-4">
          <p>Мы уважаем вашу конфиденциальность и обязуемся защищать ваши личные данные.</p>
          <p>Все данные обрабатываются в соответствии с законодательством РФ.</p>
        </div>
      )
    },
    contacts: {
      title: "Контакты",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            <a href="https://github.com/Or3yn/ITPlanet" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              GitHub проекта
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            <a href="https://t.me/Eagwynn" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Telegram
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <a href="mailto:zxcbogdanova@gmail.com" className="text-blue-500 hover:underline">
              zxcbogdanova@gmail.com
            </a>
          </div>
        </div>
      )
    },
    help: {
      title: "Помощь",
      content: (
        <div className="space-y-4">
          <p>Если у вас возникли вопросы или проблемы при использовании приложения, вы можете:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Обратиться в поддержку через Telegram</li>
            <li>Написать на email</li>
            <li>Создать issue на GitHub</li>
          </ul>
        </div>
      )
    }
  }

  return (
    <footer className="border-t py-8 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <Link href="/" className="text-lg font-bold">
              🌕 Планировщик лунной базы
            </Link>
            <p className="text-sm text-gray-600 mt-1">© 2025 Планировщик лунной базы. Все права защищены, решение принадлежит ITPlanet.</p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-center md:text-right">
            {Object.entries(dialogs).map(([key, { title }]) => (
              <button
                key={key}
                onClick={() => setOpenDialog(key)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {Object.entries(dialogs).map(([key, { title, content }]) => (
        <Dialog key={key} open={openDialog === key} onOpenChange={() => setOpenDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      ))}
    </footer>
  )
} 