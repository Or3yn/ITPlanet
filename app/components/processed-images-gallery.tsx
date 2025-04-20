"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface ImageSet {
  prefix: string;
  images: {
    [key: string]: string;
  };
  jsonPath: string | null;
  jsonExists: boolean;
}

interface ProcessedImagesResponse {
  images: ImageSet[];
  count: number;
  error?: string;
}

export default function ProcessedImagesGallery() {
  const [processedImages, setProcessedImages] = useState<ImageSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<ImageSet | null>(null);

  useEffect(() => {
    async function fetchProcessedImages() {
      try {
        setLoading(true);
        const response = await fetch("/api/list-processed-images");
        const data: ProcessedImagesResponse = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setProcessedImages(data.images);
          if (data.images.length > 0) {
            setSelectedSet(data.images[0]);
          }
        }
      } catch (err) {
        setError("Ошибка при загрузке списка обработанных изображений");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProcessedImages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md my-4">
        <p className="font-medium">Ошибка:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (processedImages.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md my-4">
        <p className="font-medium">Нет обработанных изображений</p>
        <p>Загрузите изображение для анализа в разделе "Спектральный анализ".</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-bold mb-4">Обработанные изображения</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {processedImages.map((set) => (
            <div 
              key={set.prefix}
              className={`p-3 rounded-md cursor-pointer transition-colors ${
                selectedSet?.prefix === set.prefix 
                  ? "bg-blue-100 border border-blue-300" 
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedSet(set)}
            >
              <div className="font-medium">{set.prefix}</div>
              <div className="text-xs text-gray-500 mt-1">
                {Object.keys(set.images).length} визуализаций
                {set.jsonExists && ", JSON данные доступны"}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm">
        {selectedSet ? (
          <div>
            <h3 className="font-bold mb-4">Результаты анализа: {selectedSet.prefix}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Object.entries(selectedSet.images).map(([type, path]) => (
                <div key={type} className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium mb-2 capitalize">
                    {type === "elevation" && "Карта высот"}
                    {type === "slope" && "Уклон поверхности"}
                    {type === "shadows" && "Карта теней"}
                    {type === "illumination" && "Освещенность"}
                    {type === "ice_probability" && "Вероятность льда"}
                  </h4>
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image 
                      src={path} 
                      alt={`${type} visualization`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {selectedSet.jsonExists && (
              <div className="mt-4">
                <Link 
                  href={selectedSet.jsonPath || "#"} 
                  target="_blank"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm inline-flex items-center"
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Скачать JSON с данными анализа
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Выберите набор изображений слева для просмотра</p>
          </div>
        )}
      </div>
    </div>
  );
} 