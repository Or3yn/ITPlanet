import Link from "next/link"
import ProcessedImagesGallery from "../components/processed-images-gallery"

export default function SpectralAnalysisPage() {
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
            <Link href="/spectral-analysis" className="font-medium text-blue-600">
              Спектральный анализ
            </Link>
            <Link href="/requirements" className="font-medium">
              Требования к модулям
            </Link>
          </nav>
          <button className="md:hidden">Меню</button>
        </div>
      </header>

      <main className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">Спектральный анализ поверхности Луны</h1>

          {/* Section for Processed Images */}
          <section className="mb-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">🔹 Обработанные изображения</h2> 
            <ProcessedImagesGallery />
          </section>

          {/* Section 1: Introduction */}
          <section className="mb-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">🔹 Что такое спектральный анализ?</h2>
            <p className="text-gray-700 mb-6">
              Спектральный анализ — это метод, который позволяет изучать поверхность Луны, анализируя, как она отражает
              свет в разных диапазонах спектра (от видимого света до инфракрасного и ультрафиолетового излучения). Это
              помогает определить состав поверхности и построить карту высот.
            </p>

            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <h3 className="font-bold mb-3 text-lg">Как работает спектральный анализ:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl mb-2">☀️</div>
                  <div className="font-medium">Солнечный свет</div>
                  <div className="text-sm text-gray-600">Содержит все длины волн</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-2xl">→</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl mb-2">🌕</div>
                  <div className="font-medium">Поверхность Луны</div>
                  <div className="text-sm text-gray-600">Отражает свет по-разному</div>
                </div>
              </div>
              <div className="flex justify-center my-4">
                <div className="text-2xl">↓</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="text-3xl mb-2">📡</div>
                <div className="font-medium">Спутник фиксирует отраженный свет</div>
                <div className="text-sm text-gray-600">Разные материалы отражают разные длины волн</div>
              </div>
            </div>
          </section>

          {/* Section 2: Data to Map */}
          <section className="mb-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">🔹 Как данные превращаются в карту?</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center font-bold text-blue-800 mr-4 flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold mb-1">Спутник делает мультиспектральные снимки Луны</h3>
                  <p className="text-gray-700">
                    Камеры на спутнике фиксируют отражение в разных диапазонах спектра (видимый свет, инфракрасный,
                    ультрафиолетовый).
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center font-bold text-blue-800 mr-4 flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold mb-1">Данные обрабатываются</h3>
                  <p className="text-gray-700">
                    Специальные алгоритмы удаляют шумы, корректируют ошибки и нормализуют данные для дальнейшего
                    анализа.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center font-bold text-blue-800 mr-4 flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold mb-1">Яркость пикселей сопоставляется с высотой</h3>
                  <p className="text-gray-700">
                    Используя известные контрольные точки, алгоритм калибрует данные и преобразует спектральные
                    характеристики в высотные отметки.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center font-bold text-blue-800 mr-4 flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-bold mb-1">Генерируется 3D-карта рельефа</h3>
                  <p className="text-gray-700">
                    На основе полученных данных создается трехмерная модель поверхности с точностью до 1 метра.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-100 p-4 rounded-lg">
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-200 p-2 rounded text-center">
                  <div className="text-xs font-medium mb-1">Спутниковый снимок</div>
                  <div className="aspect-square bg-gray-300 rounded"></div>
                </div>
                <div className="bg-gray-200 p-2 rounded text-center">
                  <div className="text-xs font-medium mb-1">Обработка данных</div>
                  <div className="aspect-square bg-gray-400 rounded"></div>
                </div>
                <div className="bg-gray-200 p-2 rounded text-center">
                  <div className="text-xs font-medium mb-1">Высотная карта</div>
                  <div className="aspect-square bg-gradient-to-br from-blue-300 via-green-400 to-red-400 rounded"></div>
                </div>
                <div className="bg-gray-200 p-2 rounded text-center">
                  <div className="text-xs font-medium mb-1">3D-модель</div>
                  <div className="aspect-square bg-gradient-to-br from-blue-300 via-green-400 to-red-400 rounded shadow-inner"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: How to Read the Map */}
          <section className="mb-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">🔹 Как читать карту?</h2>

            <p className="text-gray-700 mb-6">
              Цвета на карте рельефа показывают высоту различных участков лунной поверхности. Это помогает быстро
              определить особенности рельефа и выбрать подходящие места для размещения объектов.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold mb-3">Цветовая схема высот:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-blue-400 rounded mr-3"></div>
                    <span>Синие оттенки = низины (0-100 м)</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-400 rounded mr-3"></div>
                    <span>Зеленые = равнинные участки (100-300 м)</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-400 rounded mr-3"></div>
                    <span>Желтые = холмы (300-400 м)</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-red-400 rounded mr-3"></div>
                    <span>Красные = высокие точки (400-500 м)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-3">Пример интерпретации:</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="mb-3">
                    Если участок имеет <span className="font-bold text-red-500">красный оттенок</span>, значит, он
                    расположен на возвышенности.
                  </p>
                  <p>
                    Это может быть хорошим местом для размещения <span className="font-bold">вышки связи</span> или{" "}
                    <span className="font-bold">астрономической площадки</span>, но не подходит для{" "}
                    <span className="font-bold">космодрома</span>, требующего ровной поверхности.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                <span className="mr-2">💡</span> Совет
              </h3>
              <p className="text-blue-700">
                При планировании базы обращайте внимание не только на высоту, но и на уклон поверхности. Крутые склоны
                (резкие переходы цветов) могут быть непригодны для строительства.
              </p>
            </div>
          </section>

          <section className="mb-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">🔹 Спектральные цвета и их значение</h2>

            <p className="text-gray-700 mb-6">
              Настоящий спектральный анализ должен включать широкий диапазон цветов для представления различных
              материалов и характеристик поверхности.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">Цветовая интерпретация спектра:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">🔵 Синий</span>
                      <p className="text-sm text-gray-600">Лед, замороженная вода, тени, холодные регионы</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">🟢 Зеленый</span>
                      <p className="text-sm text-gray-600">Минералы с высоким отражением, реголит средней плотности</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">🟡 Желтый</span>
                      <p className="text-sm text-gray-600">
                        Высокое содержание оксидов металлов, вулканическая активность
                      </p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">🟠 Оранжевый</span>
                      <p className="text-sm text-gray-600">
                        Высокая температура поверхности, солнечно освещенные регионы
                      </p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">🔴 Красный</span>
                      <p className="text-sm text-gray-600">Глубокие кратеры, железосодержащие породы</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">🟣 Фиолетовый</span>
                      <p className="text-sm text-gray-600">Базальтовые лавовые равнины, темные поверхности</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-3">Применение в анализе:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Пример интерпретации спектра:</h4>
                    <div className="flex items-center mb-2">
                      <div className="w-full h-8 rounded-md bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-500"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Лед/вода</span>
                      <span>Минералы</span>
                      <span>Оксиды</span>
                      <span>Тепло</span>
                      <span>Железо</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    Комбинация цветов на спектральной карте позволяет определить:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                    <li>Состав поверхности и подповерхностных слоев</li>
                    <li>Потенциальные места для добычи ресурсов</li>
                    <li>Геологическую историю региона</li>
                    <li>Термальные аномалии и активные процессы</li>
                    <li>Оптимальные места для размещения различных типов модулей</li>
                  </ul>
                </div>

                <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-1 flex items-center">
                    <span className="mr-2">🔍</span> Интересный факт
                  </h4>
                  <p className="text-sm text-blue-700">
                    Спектральный анализ позволил обнаружить залежи водяного льда в постоянно затененных кратерах Южного
                    полюса Луны, что делает этот регион особенно привлекательным для создания лунной базы.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold mb-3 text-center">Сравнение спектральных данных в разных диапазонах</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-center mb-2">Видимый спектр</h4>
                  <div className="aspect-square bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 rounded-lg mb-2"></div>
                  <p className="text-xs text-gray-600 text-center">Отражает видимые глазом особенности поверхности</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-center mb-2">Инфракрасный спектр</h4>
                  <div className="aspect-square bg-gradient-to-br from-blue-300 via-purple-400 to-red-400 rounded-lg mb-2"></div>
                  <p className="text-xs text-gray-600 text-center">Выявляет тепловые аномалии и состав минералов</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-center mb-2">Ультрафиолетовый спектр</h4>
                  <div className="aspect-square bg-gradient-to-br from-purple-300 via-indigo-400 to-blue-300 rounded-lg mb-2"></div>
                  <p className="text-xs text-gray-600 text-center">Определяет химический состав и возраст пород</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Why It's Important */}
          <section className="mb-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">🔹 Почему это важно для строительства лунной базы?</h2>

            <p className="text-gray-700 mb-6">
              Знание рельефа Луны позволяет принимать обоснованные решения при планировании лунной базы, обеспечивая
              безопасность и эффективность будущей инфраструктуры.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-3xl mb-2 text-center">🏠</div>
                <h3 className="font-bold text-center mb-2">Безопасное размещение</h3>
                <p className="text-sm text-gray-700">
                  Выбор ровных участков с подходящим грунтом для строительства модулей и инфраструктуры.
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-3xl mb-2 text-center">☀️</div>
                <h3 className="font-bold text-center mb-2">Доступ к солнечному свету</h3>
                <p className="text-sm text-gray-700">
                  Определение зон с максимальной освещенностью для размещения солнечных батарей.
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-3xl mb-2 text-center">💧</div>
                <h3 className="font-bold text-center mb-2">Поиск водяного льда</h3>
                <p className="text-sm text-gray-700">
                  Выявление потенциальных участков с водяным льдом, критически важным ресурсом для жизни на Луне.
                </p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold mb-3">Идеальное место для базы:</h3>
              <div className="relative h-48 bg-gradient-to-br from-blue-300 via-green-400 to-yellow-400 rounded-lg overflow-hidden">
                <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-white bg-opacity-70 rounded-lg flex items-center justify-center text-lg font-bold">
                  БАЗА
                </div>
                <div className="absolute bottom-4 right-4 bg-white p-2 rounded text-sm">
                  <div className="font-bold">Оптимальное расположение:</div>
                  <ul className="text-xs">
                    <li>✓ Ровная поверхность</li>
                    <li>✓ Близость к залежам льда</li>
                    <li>✓ Доступ к солнечному свету</li>
                    <li>✓ Защита от радиации</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Interactive Test */}
          <section className="mb-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">🔹 Проверьте свои знания</h2>

            <p className="text-gray-700 mb-6">
              Хотите проверить, насколько хорошо вы понимаете спектральный анализ? Пройдите небольшой тест, чтобы
              закрепить полученные знания.
            </p>

            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold mb-3">Вопрос 1: Что означает красный цвет на карте рельефа?</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="radio" id="q1a" name="q1" className="mr-2" />
                    <label htmlFor="q1a">Низины (0-100 м)</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="q1b" name="q1" className="mr-2" />
                    <label htmlFor="q1b">Равнинные участки (100-300 м)</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="q1c" name="q1" className="mr-2" />
                    <label htmlFor="q1c">Холмы (300-400 м)</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="q1d" name="q1" className="mr-2" />
                    <label htmlFor="q1d">Высокие точки (400-500 м)</label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold mb-3">
                  Вопрос 2: Какой тип объекта лучше всего размещать на ровной поверхности?
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="radio" id="q2a" name="q2" className="mr-2" />
                    <label htmlFor="q2a">Вышка связи</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="q2b" name="q2" className="mr-2" />
                    <label htmlFor="q2b">Космодром</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="q2c" name="q2" className="mr-2" />
                    <label htmlFor="q2c">Астрономическая площадка</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="q2d" name="q2" className="mr-2" />
                    <label htmlFor="q2d">Добывающая шахта</label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold mb-3">
                  Вопрос 3: Для чего используется спектральный анализ поверхности Луны?
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="radio" id="q3a" name="q3" className="mr-2" />
                    <label htmlFor="q3a">Только для определения высоты</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="q3b" name="q3" className="mr-2" />
                    <label htmlFor="q3b">Только для поиска воды</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="q3c" name="q3" className="mr-2" />
                    <label htmlFor="q3c">Для определения состава поверхности и построения карты высот</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="q3d" name="q3" className="mr-2" />
                    <label htmlFor="q3d">Только для измерения температуры</label>
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
              Проверить ответы
            </button>
          </section>

          {/* Return Button */}
          <div className="text-center">
            <Link
              href="/moon-map"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium inline-block transition-colors"
            >
              🔙 Вернуться к конструктору
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 px-6 bg-gray-50 mt-8">
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
    </div>
  )
}

