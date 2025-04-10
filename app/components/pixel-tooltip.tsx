"use client"

import { useEffect } from "react"

export default function PixelTooltip() {
  useEffect(() => {
    const pixelMatrix = document.getElementById("pixel-matrix")
    const tooltip = document.getElementById("pixel-tooltip")
    const tooltipHeight = document.getElementById("tooltip-height")
    const tooltipSurface = document.getElementById("tooltip-surface")
    const tooltipSpectrum = document.getElementById("tooltip-spectrum")
    const tooltipComposition = document.getElementById("tooltip-composition")

    if (!pixelMatrix || !tooltip || !tooltipHeight || !tooltipSurface || !tooltipSpectrum || !tooltipComposition) return

    const pixels = pixelMatrix.querySelectorAll("div[data-height]")

    pixels.forEach((pixel) => {
      pixel.addEventListener("mouseenter", (e) => {
        const target = e.target as HTMLElement
        const rect = target.getBoundingClientRect()

        const height = target.getAttribute("data-height")
        const surface = target.getAttribute("data-surface")
        const spectrum = target.getAttribute("data-spectrum")
        const composition = target.getAttribute("data-composition")

        tooltipHeight.textContent = `Высота: ${height} м`
        tooltipSurface.textContent = `Тип поверхности: ${surface}`
        tooltipSpectrum.textContent = `Спектр: ${spectrum}`
        tooltipComposition.textContent = `Состав: ${composition}`

        tooltip.style.left = `${rect.left + window.scrollX}px`
        tooltip.style.top = `${rect.top + window.scrollY - 100}px`
        tooltip.classList.remove("hidden")
      })

      pixel.addEventListener("mouseleave", () => {
        tooltip.classList.add("hidden")
      })
    })

    // Mode switching button
    const modeButtons = document.querySelectorAll('button[class*="px-3 py-1"]')
    const currentMode = "height" // height or spectrum

    modeButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        // Reset all buttons
        modeButtons.forEach((btn) => {
          btn.className = "px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300"
        })

        // Set active button
        button.className = "px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"

        // Change visualization based on selected mode
        if (index === 0) {
          // Visible spectrum
          updatePixelsForMode("visible")
        } else if (index === 1) {
          // IR analysis
          updatePixelsForMode("ir")
        } else if (index === 2) {
          // UV analysis
          updatePixelsForMode("uv")
        } else if (index === 3) {
          // X-ray analysis
          updatePixelsForMode("xray")
        }
      })
    })

    function updatePixelsForMode(mode: string) {
      pixels.forEach((pixel) => {
        const element = pixel as HTMLElement
        const height = Number.parseInt(element.getAttribute("data-height") || "0")

        if (mode === "visible") {
          // Original height-based colors
          if (height <= 100) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-blue-300")
          } else if (height <= 150) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-blue-400")
          } else if (height <= 200) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-blue-500")
          } else if (height <= 300) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-green-400")
          } else if (height <= 350) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-green-500")
          } else if (height <= 400) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-yellow-400")
          } else {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-red-500")
          }

          // Update gradient bar
          const gradientBar = document.querySelector(".h-4.bg-gradient-to-r")
          if (gradientBar) {
            gradientBar.className = gradientBar.className.replace(
              /from-\w+-\d+ via-\w+-\d+ via-\w+-\d+ via-\w+-\d+ to-\w+-\d+/,
              "from-blue-300 via-green-400 via-yellow-400 via-orange-400 to-red-500",
            )
          }
        } else if (mode === "ir") {
          // IR spectrum colors (temperature based)
          if (height <= 100) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-blue-800")
          } else if (height <= 200) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-blue-500")
          } else if (height <= 300) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-purple-500")
          } else if (height <= 400) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-red-400")
          } else {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-red-600")
          }

          // Update gradient bar
          const gradientBar = document.querySelector(".h-4.bg-gradient-to-r")
          if (gradientBar) {
            gradientBar.className = gradientBar.className.replace(
              /from-\w+-\d+ via-\w+-\d+ via-\w+-\d+ via-\w+-\d+ to-\w+-\d+/,
              "from-blue-800 via-blue-500 via-purple-500 to-red-600",
            )
          }
        } else if (mode === "uv") {
          // UV spectrum colors (mineral composition based)
          const composition = element.getAttribute("data-composition") || ""
          if (composition.includes("Лед") || composition.includes("вода")) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-indigo-300")
          } else if (composition.includes("Минералы")) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-purple-400")
          } else if (composition.includes("Реголит")) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-violet-300")
          } else if (composition.includes("Оксиды")) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-pink-400")
          } else if (composition.includes("кратеры") || composition.includes("железо")) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-pink-600")
          } else {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-indigo-500")
          }

          // Update gradient bar
          const gradientBar = document.querySelector(".h-4.bg-gradient-to-r")
          if (gradientBar) {
            gradientBar.className = gradientBar.className.replace(
              /from-\w+-\d+ via-\w+-\d+ via-\w+-\d+ via-\w+-\d+ to-\w+-\d+/,
              "from-indigo-300 via-violet-300 via-purple-400 via-pink-400 to-pink-600",
            )
          }
        } else if (mode === "xray") {
          // X-ray spectrum (density based)
          if (height <= 100) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-gray-300")
          } else if (height <= 200) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-gray-400")
          } else if (height <= 300) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-gray-500")
          } else if (height <= 400) {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-gray-600")
          } else {
            element.className = element.className.replace(/bg-\w+-\d+/, "bg-gray-800")
          }

          // Update gradient bar
          const gradientBar = document.querySelector(".h-4.bg-gradient-to-r")
          if (gradientBar) {
            gradientBar.className = gradientBar.className.replace(
              /from-\w+-\d+ via-\w+-\d+ via-\w+-\d+ via-\w+-\d+ to-\w+-\d+/,
              "from-gray-300 via-gray-400 via-gray-600 to-gray-800",
            )
          }
        }
      })
    }

    // Animation on page load
    const animatePixels = () => {
      // First make all pixels black and white
      pixels.forEach((pixel, index) => {
        const element = pixel as HTMLElement
        element.className = element.className.replace(/bg-\w+-\d+/, "bg-gray-400")

        // Then gradually apply colors with delay
        setTimeout(
          () => {
            const height = Number.parseInt(element.getAttribute("data-height") || "0")
            if (height <= 100) {
              element.className = element.className.replace(/bg-\w+-\d+/, "bg-blue-300")
            } else if (height <= 150) {
              element.className = element.className.replace(/bg-\w+-\d+/, "bg-blue-400")
            } else if (height <= 200) {
              element.className = element.className.replace(/bg-\w+-\d+/, "bg-blue-500")
            } else if (height <= 300) {
              element.className = element.className.replace(/bg-\w+-\d+/, "bg-green-400")
            } else if (height <= 350) {
              element.className = element.className.replace(/bg-\w+-\d+/, "bg-green-500")
            } else if (height <= 400) {
              element.className = element.className.replace(/bg-\w+-\d+/, "bg-yellow-400")
            } else {
              element.className = element.className.replace(/bg-\w+-\d+/, "bg-red-500")
            }
          },
          1000 + index * 50,
        ) // Staggered animation
      })
    }

    // Run animation on load
    setTimeout(animatePixels, 500)

    return () => {
      // Cleanup event listeners
      pixels.forEach((pixel) => {
        pixel.removeEventListener("mouseenter", () => {})
        pixel.removeEventListener("mouseleave", () => {})
      })

      modeButtons.forEach((button) => {
        button.removeEventListener("click", () => {})
      })
    }
  }, [])

  return null
}

