import Link from "next/link"
import PixelTooltip from "./components/pixel-tooltip"

export default function Home() {
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
            <Link href="/" className="font-medium text-blue-600">
              Главная
            </Link>
            <Link href="/moon-map" className="font-medium">
              Конструктор
            </Link>
            <Link href="/spectral-analysis" className="font-medium">
              Спектральный анализ
            </Link>
            <Link href="/requirements" className="font-medium">
              Требования к модулям
            </Link>
          </nav>
          <button className="md:hidden">Меню</button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gray-100 py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Создайте свою лунную базу на Южном полюсе Луны!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Планируйте размещение инфраструктуры с учетом реальных условий и требований безопасности.
            </p>
            <Link href="/moon-map" className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium">
              Начать проектирование
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">Основные функции</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">Исследование поверхности</h3>
                <p className="text-gray-600">
                  Выбирайте лучшие участки для объектов на основе подробного анализа рельефа и спектральных данных.
                </p>
              </div>

              <div className="border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">🏗️</div>
                <h3 className="text-xl font-bold mb-2">Размещение объектов</h3>
                <p className="text-gray-600">
                  Автоматический подбор подходящих зон, проверка условий безопасности и функциональности.
                </p>
              </div>

              <div className="border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">🛣️</div>
                <h3 className="text-xl font-bold mb-2">Планирование маршрутов</h3>
                <p className="text-gray-600">
                  Создавайте оптимальные пути между объектами для безопасного и удобного перемещения по базе.
                </p>
              </div>

              <div className="border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">♻️</div>
                <h3 className="text-xl font-bold mb-2">Управление ресурсами</h3>
                <p className="text-gray-600">
                  Планируйте распределение ресурсов, оптимизируйте энергопотребление и обеспечивайте устойчивое развитие
                  базы.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Spectral Analysis Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">Спектральный анализ поверхности Луны</h2>

            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <Link href="/spectral-analysis" className="px-4 py-2 rounded-md hover:bg-blue-100 transition-colors">
                  Подробная информация
                </Link>
                <Link href="/moon-map" className="px-4 py-2 rounded-md hover:bg-blue-100 transition-colors">
                  Применить в конструкторе
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="mr-2">ℹ️</span> Алгоритм преобразования спектральных яркостей
                </h3>
                <p className="text-gray-600 mb-4">
                  Спектральный анализ помогает определить рельеф Луны, превращая отраженные световые волны в данные о
                  высоте. Наш алгоритм преобразует данные спектральных яркостей в высотные отметки в диапазоне 0-500
                  метров. Процесс включает следующие этапы:
                </p>
                <ol className="list-decimal pl-5 text-gray-600 space-y-2 mb-6">
                  <li>Получение многоспектральных снимков поверхности Южного полюса Луны</li>
                  <li>Нормализация данных и устранение шумов</li>
                  <li>Применение алгоритма преобразования спектральных яркостей в высотные отметки</li>
                  <li>Калибровка результатов с использованием известных высотных точек</li>
                  <li>
                    Создание трехмерной модели рельефа с точностью до 1 метра{" "}
                    <span className="text-blue-600">(см. карту справа)</span>
                  </li>
                </ol>

                <h3 className="text-xl font-bold mb-4">Создание гео-слоя для интерактивного отображения</h3>
                <p className="text-gray-600 mb-6">
                  На основе полученных данных создается интерактивный гео-слой, который позволяет:
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-6">
                  <li>Визуализировать рельеф в 2D и 3D представлении</li>
                  <li>Анализировать уклоны и особенности поверхности</li>
                  <li>Определять оптимальные зоны для размещения различных типов объектов</li>
                  <li>Моделировать условия освещенности в разные периоды</li>
                </ul>

                <Link
                  href="/spectral-analysis"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium inline-block hover:bg-blue-700 hover:shadow-md transition-all"
                >
                  Узнать больше о спектральном анализе Луны
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-center">Как цвета пикселей показывают рельеф Луны?</h3>

                {/* Interactive pixel matrix */}
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium mb-3 text-center">
                    Как цвета пикселей показывают рельеф и состав Луны
                  </h3>

                  <div className="flex justify-between mb-3">
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                      Видимый спектр
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300">
                      ИК-анализ
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300">
                      УФ-анализ
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300">
                      Рентгеновский анализ
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-1 mb-4" id="pixel-matrix">
                    {/* Row 1 */}
                    <div
                      className="aspect-square bg-blue-300 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="50"
                      data-surface="Пыльный слой"
                      data-spectrum="Слабое отражение в ИК-диапазоне"
                      data-composition="Лед, замороженная вода"
                    ></div>
                    <div
                      className="aspect-square bg-blue-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="100"
                      data-surface="Пыльный слой"
                      data-spectrum="Среднее отражение в ИК-диапазоне"
                      data-composition="Холодные регионы, тени"
                    ></div>
                    <div
                      className="aspect-square bg-blue-500 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="150"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в ИК-диапазоне"
                      data-composition="Минералы с высоким отражением"
                    ></div>
                    <div
                      className="aspect-square bg-blue-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="100"
                      data-surface="Пыльный слой"
                      data-spectrum="Среднее отражение в ИК-диапазоне"
                      data-composition="Холодные регионы, тени"
                    ></div>
                    <div
                      className="aspect-square bg-blue-300 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="50"
                      data-surface="Пыльный слой"
                      data-spectrum="Слабое отражение в ИК-диапазоне"
                      data-composition="Лед, замороженная вода"
                    ></div>

                    {/* Row 2 */}
                    <div
                      className="aspect-square bg-blue-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="100"
                      data-surface="Пыльный слой"
                      data-spectrum="Среднее отражение в ИК-диапазоне"
                      data-composition="Холодные регионы, тени"
                    ></div>
                    <div
                      className="aspect-square bg-green-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="200"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в видимом диапазоне"
                      data-composition="Реголит средней плотности"
                    ></div>
                    <div
                      className="aspect-square bg-green-500 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="250"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в видимом диапазоне"
                      data-composition="Минералы с высоким отражением"
                    ></div>
                    <div
                      className="aspect-square bg-green-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="200"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в видимом диапазоне"
                      data-composition="Реголит средней плотности"
                    ></div>
                    <div
                      className="aspect-square bg-blue-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="100"
                      data-surface="Пыльный слой"
                      data-spectrum="Среднее отражение в ИК-диапазоне"
                      data-composition="Холодные регионы, тени"
                    ></div>

                    {/* Row 3 */}
                    <div
                      className="aspect-square bg-green-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="200"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в видимом диапазоне"
                      data-composition="Реголит средней плотности"
                    ></div>
                    <div
                      className="aspect-square bg-yellow-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="350"
                      data-surface="Скалистая поверхность"
                      data-spectrum="Высокое отражение в УФ-диапазоне"
                      data-composition="Оксиды металлов, вулканическая активность"
                    ></div>
                    <div
                      className="aspect-square bg-red-500 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="450"
                      data-surface="Скалистая поверхность"
                      data-spectrum="Максимальное отражение в УФ-диапазоне"
                      data-composition="Глубокие кратеры, железосодержащие породы"
                    ></div>
                    <div
                      className="aspect-square bg-yellow-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="350"
                      data-surface="Скалистая поверхность"
                      data-spectrum="Высокое отражение в УФ-диапазоне"
                      data-composition="Оксиды металлов, вулканическая активность"
                    ></div>
                    <div
                      className="aspect-square bg-green-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="200"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в видимом диапазоне"
                      data-composition="Реголит средней плотности"
                    ></div>

                    {/* Row 4 */}
                    <div
                      className="aspect-square bg-blue-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="100"
                      data-surface="Пыльный слой"
                      data-spectrum="Среднее отражение в ИК-диапазоне"
                      data-composition="Холодные регионы, тени"
                    ></div>
                    <div
                      className="aspect-square bg-green-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="200"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в видимом диапазоне"
                      data-composition="Реголит средней плотности"
                    ></div>
                    <div
                      className="aspect-square bg-green-500 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="250"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в видимом диапазоне"
                      data-composition="Минералы с высоким отражением"
                    ></div>
                    <div
                      className="aspect-square bg-green-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="200"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в видимом диапазоне"
                      data-composition="Реголит средней плотности"
                    ></div>
                    <div
                      className="aspect-square bg-blue-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="100"
                      data-surface="Пыльный слой"
                      data-spectrum="Среднее отражение в ИК-диапазоне"
                      data-composition="Холодные регионы, тени"
                    ></div>

                    {/* Row 5 */}
                    <div
                      className="aspect-square bg-blue-300 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="50"
                      data-surface="Пыльный слой"
                      data-spectrum="Слабое отражение в ИК-диапазоне"
                      data-composition="Лед, замороженная вода"
                    ></div>
                    <div
                      className="aspect-square bg-blue-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="100"
                      data-surface="Пыльный слой"
                      data-spectrum="Среднее отражение в ИК-диапазоне"
                      data-composition="Холодные регионы, тени"
                    ></div>
                    <div
                      className="aspect-square bg-blue-500 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="150"
                      data-surface="Каменистая область"
                      data-spectrum="Сильное отражение в ИК-диапазоне"
                      data-composition="Минералы с высоким отражением"
                    ></div>
                    <div
                      className="aspect-square bg-blue-400 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="100"
                      data-surface="Пыльный слой"
                      data-spectrum="Среднее отражение в ИК-диапазоне"
                      data-composition="Холодные регионы, тени"
                    ></div>
                    <div
                      className="aspect-square bg-blue-300 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      data-height="50"
                      data-surface="Пыльный слой"
                      data-spectrum="Слабое отражение в ИК-диапазоне"
                      data-composition="Лед, замороженная вода"
                    ></div>
                  </div>

                  {/* Enhanced tooltip for pixel data */}
                  <div
                    id="pixel-tooltip"
                    className="hidden absolute bg-white p-3 rounded shadow-md text-sm z-10 w-64 border border-gray-200"
                  >
                    <div className="font-bold text-blue-700 mb-1" id="tooltip-height">
                      Высота: 0 м
                    </div>
                    <div id="tooltip-surface" className="mb-1">
                      Тип поверхности: -
                    </div>
                    <div id="tooltip-spectrum" className="mb-1">
                      Спектр: -
                    </div>
                    <div id="tooltip-composition" className="text-green-700">
                      Состав: -
                    </div>
                  </div>

                  {/* Color scale with labels */}
                  <div className="mt-4">
                    <div className="flex justify-between mb-1 text-xs text-gray-500">
                      <span>Лед/вода</span>
                      <span>Минералы</span>
                      <span>Оксиды</span>
                      <span>Тепло</span>
                      <span>Железо</span>
                    </div>
                    <div className="h-4 bg-gradient-to-r from-blue-300 via-green-400 via-yellow-400 via-orange-400 to-red-500 rounded-full"></div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>0 м</span>
                      <span>100 м</span>
                      <span>200 м</span>
                      <span>300 м</span>
                      <span>400 м</span>
                      <span>500 м</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-md">
                      <h4 className="font-bold text-blue-800 mb-1">📡 Данные спутниковых снимков</h4>
                      <p className="text-xs text-blue-700">Спектральные яркости в различных диапазонах</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md">
                      <h4 className="font-bold text-green-800 mb-1">📊 Итоговый рельеф Луны</h4>
                      <p className="text-xs text-green-700">Высотные отметки рельефа (0-500 м)</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-md">
                      <h4 className="font-bold text-purple-800 mb-1">🧪 Состав поверхности</h4>
                      <p className="text-xs text-purple-700">Минералогический и химический анализ</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Примечание:</strong> Точность преобразования зависит от качества исходных данных и может
                    варьироваться в пределах ±5 метров.
                  </p>
                  <p className="flex items-start">
                    <span className="text-blue-600 mr-1">ℹ️</span>
                    <span>
                      Чем выше точность данных, тем лучше анализ. Для повышения точности используются опорные точки с
                      известными высотами, полученные с помощью лазерной альтиметрии.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Project Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">🎯 О проекте</h2>
            <div className="bg-white border rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-blue-700">
                🚀 Колонизация Луны – новый шаг для человечества
              </h3>
              <p className="text-lg mb-6">
                Луна, ближайший спутник Земли, рассматривается как первая внеземная база для будущих поколений. Однако
                её освоение требует точного планирования – важно учитывать суровые условия, ресурсы и возможности для
                развития инфраструктуры.
              </p>

              <div className="mb-6">
                <h4 className="text-xl font-bold mb-4 text-blue-600">🏗️ Почему Южный полюс Луны?</h4>
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✅</span>
                    <span>
                      В этом регионе обнаружены залежи водяного льда, который можно превращать в кислород и водород –
                      ключевые компоненты для жизнеобеспечения и топлива.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✅</span>
                    <span>
                      Некоторые области почти постоянно освещены Солнцем, что делает возможным использование солнечных
                      электростанций.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✅</span>
                    <span>Южный полюс – приоритетное место для будущих космических миссий.</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-xl font-bold mb-4 text-blue-600">🛠️ Технологии проекта</h4>
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 font-bold">📊</span>
                    <span>Геоинформационные системы – анализ поверхности и рельефа.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 font-bold">🛰️</span>
                    <span>Спектральный анализ снимков Луны – выявление потенциальных зон строительства.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 font-bold">🤖</span>
                    <span>
                      Алгоритмы оптимального размещения – автоматизированные расчёты с учётом заданных критериев.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                <h4 className="text-xl font-bold mb-3 text-blue-700">🌍 Наш проект участвует в "IT-Планета 2025"</h4>
                <p className="text-gray-700">
                  "Планировщик лунной базы" разрабатывается в рамках международного конкурса "Космический кубок: Миссия
                  ЛУНА", где лучшие решения помогут создать цифровую модель будущей базы на Луне.
                </p>
              </div>

              <p className="text-center text-lg font-semibold text-blue-600">
                📅 Следите за обновлениями и присоединяйтесь к будущему лунной колонизации! 🚀
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <Link href="/" className="text-lg font-bold">
                🌕 Планировщик лунной базы
              </Link>
              <p className="text-sm text-gray-600 mt-1">© 2025 Планировщик лунной базы. Все права защищены.</p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-center md:text-right">
              <Link href="#" className="text-sm text-gray-600">
                Условия использования
              </Link>
              <Link href="#" className="text-sm text-gray-600">
                Политика конфиденциальности
              </Link>
              <Link href="#" className="text-sm text-gray-600">
                Контакты
              </Link>
              <Link href="#" className="text-sm text-gray-600">
                Помощь
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <PixelTooltip />
    </div>
  )
}

