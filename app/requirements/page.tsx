import Link from "next/link"
import { Footer } from "@/components/ui/footer"

export default function RequirementsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/" className="text-xl font-bold">
              🌕 Планировщик лунной базы
            </Link>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="font-medium">
              Главная
            </Link>
            <Link href="/moon-map" className="font-medium">
              Конструктор
            </Link>
            <Link href="/spectral-analysis" className="font-medium">
              Спектральный анализ
            </Link>
            <Link href="/requirements" className="font-medium text-blue-600">
              Требования к модулям
            </Link>
          </nav>
          <button className="md:hidden">Меню</button>
        </div>
      </header>

      <main className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">Требования к модулям лунной базы</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Обитаемые модули */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-blue-700">🏠 Обитаемые модули</h2>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Общие требования:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Герметичность, давление 101,3 кПа, температура +18–25°C, влажность 40–60%.</li>
                  <li>Защита слоем реголита 1–3 м.</li>
                  <li>Допустимое размещение в кратерах или лавовых трубах с четкими критериями прочности.</li>
                  <li>Автономность системы жизнеобеспечения 14 дней.</li>
                </ul>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🏘️</span>
                    Жилые модули
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Индивидуальные: 20 м² для краткосрочных экспедиций</li>
                    <li>Общие: 100–150 м² для длительного проживания</li>
                    <li>Минимальная зона безопасности: 1 клетка (50 м²)</li>
                    <li>Требуется защита от радиации слоем реголита</li>
                    <li>Близость к другим обитаемым модулям для удобства перемещения</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🏃</span>
                    Спортивные модули
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Площадь: 80–120 м²</li>
                    <li>Удаленность ≥200 м от жилых и медицинских модулей</li>
                    <li>Закрытые помещения для физической подготовки</li>
                    <li>Предотвращение атрофии мышц в условиях низкой гравитации</li>
                    <li>Зона безопасности: 3 клетки (150 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🏢</span>
                    Административные модули
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Центральное расположение относительно других модулей</li>
                    <li>Время реакции ≤60 сек до любого модуля</li>
                    <li>Система мониторинга всех объектов базы</li>
                    <li>Резервные системы связи и управления</li>
                    <li>Зона безопасности: 1 клетка (50 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🏥</span>
                    Медицинские модули
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Площадь: 60–100 м²</li>
                    <li>Время прибытия к пациентам ≤3 мин</li>
                    <li>Оборудование для первой помощи и хирургических вмешательств</li>
                    <li>Возможность длительного медицинского сопровождения</li>
                    <li>Зона безопасности: 3 клетки (150 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🔬</span>
                    Исследовательские модули
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Площадь: 100–150 м²</li>
                    <li>Научные лаборатории различного профиля</li>
                    <li>Изоляция от вибраций и электромагнитных помех</li>
                    <li>Специализированное оборудование для исследований</li>
                    <li>Зона безопасности: 2 клетки (100 м²)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Технологические объекты */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-green-700">🛠️ Технологические объекты</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🔧</span>
                    Ремонтные модули
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Площадь: 50–150 м²</li>
                    <li>Доступ ≤10 мин от любого объекта базы</li>
                    <li>Оборудование для ремонта и обслуживания техники</li>
                    <li>Запас критически важных запчастей</li>
                    <li>Зона безопасности: 1 клетка (50 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🚀</span>
                    Космодромы
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Площадь: ≥2 км²</li>
                    <li>Удаление от жилых модулей ≥5 км</li>
                    <li>Ровная поверхность без крупных кратеров</li>
                    <li>Хорошая видимость для навигации</li>
                    <li>Зона безопасности: 10 клеток (500 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">📡</span>
                    Вышки связи
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Высота: 15–25 м</li>
                    <li>Зона покрытия ≥10 км</li>
                    <li>Размещение на возвышенностях для лучшего покрытия</li>
                    <li>Резервные источники питания</li>
                    <li>Зона безопасности: 2 клетки (100 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🌱</span>
                    Плантации
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Площадь: 200–500 м²</li>
                    <li>Герметичность, защита реголитом 2 м</li>
                    <li>Специальное освещение для роста растений</li>
                    <li>Системы гидропоники и аэропоники</li>
                    <li>Зона безопасности: 1 клетка (50 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">♻️</span>
                    Мусорные полигоны
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Удаление от жилья ≥3 км</li>
                    <li>Эффективность переработки ≥90%</li>
                    <li>Изоляция от окружающей среды</li>
                    <li>Системы переработки и вторичного использования</li>
                    <li>Зона безопасности: 5 клеток (250 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🏭</span>
                    Производственные предприятия
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Площадь: 300–1000 м²</li>
                    <li>Удаление ≥2 км от жилых модулей</li>
                    <li>Оборудование для производства и переработки</li>
                    <li>Системы фильтрации и очистки</li>
                    <li>Зона безопасности: 4 клетки (200 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">🔭</span>
                    Астрономические площадки
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Размещение на возвышенностях</li>
                    <li>Удаление ≥1 км от источников света и вибраций</li>
                    <li>Защита от пыли и микрометеоритов</li>
                    <li>Стабильная платформа для телескопов</li>
                    <li>Зона безопасности: 2 клетки (100 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">☀️</span>
                    Солнечные электростанции
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Площадь: 500–2000 м²</li>
                    <li>Освещенность ≥90% времени</li>
                    <li>Размещение на возвышенностях</li>
                    <li>Системы аккумуляции энергии</li>
                    <li>Зона безопасности: 1 клетка (50 м²)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <span className="mr-2">⛏️</span>
                    Добывающие шахты
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                    <li>Глубина залегания льда ≤2 м</li>
                    <li>Геологическая безопасность места добычи</li>
                    <li>Близость к производственным предприятиям</li>
                    <li>Доступ к энергоснабжению</li>
                    <li>Зона безопасности: 3 клетки (150 м²)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Важные примечания:</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Все размеры и расстояния указаны с учетом лунных условий (1/6 гравитации Земли).</li>
              <li>
                Зоны безопасности необходимы для предотвращения взаимного влияния объектов и обеспечения безопасности
                персонала.
              </li>
              <li>
                При проектировании учитывайте экстремальные температурные колебания на поверхности Луны (от -173°C до
                +127°C).
              </li>
              <li>Все модули должны быть защищены от космической радиации и микрометеоритов.</li>
              <li>Рекомендуется размещать критически важные объекты с резервированием систем жизнеобеспечения.</li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/moon-map"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Вернуться к конструктору
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

