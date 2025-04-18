# 🌕 Lunar Base Planner / Планировщик лунной базы

## 📘 Project Overview (EN)

This project is part of the **"IT-Planet 2025" International Olympiad**, in the "Space Cup: MISSION MOON" track.

The goal of the first stage is to develop a **concept and web-based prototype** for planning and navigating a lunar base at the Moon's South Pole. This system should assist future colonists in organizing infrastructure, analyzing terrain, and managing resources efficiently.

Key functions:
- Researching lunar terrain for optimal infrastructure placement
- Planning safe, logical, and functional layouts of habitats and facilities
- Managing resources and supporting sustainable base development
- UI prototype for map-based interaction and route planning
- Automatic validation of placement criteria
- Support for importing terrain data and spectral analysis

---

## 📗 Обзор проекта (RU)

Этот проект создан в рамках **Международной олимпиады "IT-Планета 2025"**, в треке «Космический кубок: МИССИЯ ЛУНА».

Цель первого этапа – разработать **концепцию и прототип Web-решения** для планирования строительства лунной базы на Южном полюсе Луны и навигации по ней.

Основные задачи:
- Исследование лунной поверхности для выбора подходящих площадок
- Оптимальное размещение объектов инфраструктуры
- Управление ресурсами и устойчивое развитие базы
- Прототип интерфейса для отображения карты и прокладки маршрутов
- Проверка соответствия объектов заданным критериям
- Поддержка анализа высот по спектральным данным

---
## ✅ Как писать коммиты (Conventional Commits)

### 📌 Формат:
```
<тип>(область): краткое описание
```
Пример:
```
feat(auth): add login form
```

---

### 🔖 Типы коммитов:
- `feat` — новая фича
- `fix` — багфикс
- `docs` — документация
- `style` — стили, форматирование (не влияет на логику)
- `refactor` — переработка кода (без новых фич и фиксов)
- `test` — тесты
- `chore` — тех. задачи: зависимости, конфиги
- `perf` — улучшения производительности
- `build` — сборочная система
- `ci` — CI/CD процессы
- `revert` — откат коммита

---

### ⚠️ Ломающие изменения (breaking changes):
- Добавь `!` в типе:
```
feat!: switch to new API
```
- Или укажи в футере:
```
BREAKING CHANGE: удалён старый login
```

---

### 📖 Правила:
- Пиши **на английском**
- **Без точки** в конце строки
- Используй **настоящее время**: `add`, `fix`, `update`
- Один коммит — одно логическое изменение

---

### ❌ Плохие примеры:
- `update`
- `final fix`
- `temp`
- `bug`

---

Следуй этим правилам для чистой, понятной истории коммитов 🚀

## 🚀 Инструкция по запуску проекта с нуля

1. **Склонируй репозиторий:**
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

2. **Установи зависимости:**
```bash
pnpm install
```
> Если pnpm не установлен:
```bash
npm install -g pnpm
```

3. **Запусти проект:**
```bash
pnpm dev
```

4. **Открой в браузере:**
```
http://localhost:3000
```
## 🛠 Tech Stack (initial)

- **Next.js 15** — фреймворк на базе React
  - Используется App Router (`/app` папка)
  - Поддержка SSR, API Routes, Layout и прочего
- **React 19**
- **TypeScript**
- **Tailwind CSS** — утилитарная система стилей
- **pnpm** — менеджер пакетов
- **Radix UI + shadcn/ui** — готовые и настраиваемые UI-компоненты

### 🔌 Дополнительно:
- `react-hook-form`, `zod` — формы и валидация
- `lucide-react`, `sonner`, `next-themes` — иконки, уведомления, темы
- `recharts`, `cmdk`, `vaul` — кастомные UI/UX компоненты

### 📁 Структура проекта:
- `app/` — маршруты и layout'ы (Next App Router)
- `components/` — UI-компоненты
- `hooks/` — кастомные хуки
- `styles/` — Tailwind и глобальные стили
- `public/` — статические файлы
"""
