import * as React from "react"
import { useEffect } from "react"

type Theme = "dark" | "light" | "system"
type SelectedColor = "coral" | "mint" | "electric" | "binance"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultSelectedColor?: SelectedColor
  storageKey?: string
  selectedColorKey?: string
  forceDefaultSelectedColor?: boolean
}

interface ThemeProviderState {
  theme: Theme
  selectedColor: SelectedColor
  setTheme: (theme: Theme) => void
  setSelectedColor: (color: SelectedColor) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  selectedColor: "mint",
  setTheme: () => null,
  setSelectedColor: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultSelectedColor = "mint",
  storageKey = "ui-theme",
  selectedColorKey = "ui-selected-color",
  forceDefaultSelectedColor = false,
  ...props
}: ThemeProviderProps) {

  // Forzar siempre tema oscuro
  const [theme,_] = React.useState<Theme>(() => "dark")

  const [selectedColor, setSelectedColor] = React.useState<SelectedColor>(() => {
    // Si forceDefaultSelectedColor está activo, siempre usar el default e ignorar localStorage
    if (forceDefaultSelectedColor) {
      // Limpiar cualquier valor previo en localStorage
      localStorage.setItem(selectedColorKey, defaultSelectedColor)
      return defaultSelectedColor
    }
    // Si no, intentar leer de localStorage, pero validar que sea un color válido
    const stored = localStorage.getItem(selectedColorKey) as SelectedColor
    const validColors: SelectedColor[] = ["coral", "mint", "electric", "binance"]
    return stored && validColors.includes(stored) ? stored : defaultSelectedColor
  })

  useEffect(() => {
    if (forceDefaultSelectedColor) {
      // Forzar el color por defecto y limpiar cualquier valor previo en localStorage
      // Esto se ejecuta en cada render para asegurar que siempre esté sincronizado
      localStorage.setItem(selectedColorKey, defaultSelectedColor)
      if (selectedColor !== defaultSelectedColor) {
        setSelectedColor(defaultSelectedColor)
      }
    }
  }, [forceDefaultSelectedColor, defaultSelectedColor, selectedColorKey, selectedColor])

  // Establecer atributos inmediatamente al montar
  React.useEffect(() => {
    const root = window.document.documentElement
    
    // Forzar siempre tema oscuro
    root.classList.remove("light", "dark")
    root.classList.add("dark")
    root.setAttribute("data-theme", "dark")
    
    // Establecer color seleccionado inmediatamente
    const colorToUse = forceDefaultSelectedColor ? defaultSelectedColor : selectedColor
    root.setAttribute("data-selected", colorToUse)
  }, []) // Solo al montar

  useEffect(() => {
    const root = window.document.documentElement
    try {
      root.classList.add('theme-transition')
      window.setTimeout(() => {
        root.classList.remove('theme-transition')
      }, 300)
    } catch { }

    // Forzar siempre tema oscuro
    root.classList.remove("light", "dark")
    root.classList.add("dark")
    root.setAttribute("data-theme", "dark")
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    // Smooth transition hook
    try {
      root.classList.add('theme-transition')
      window.setTimeout(() => {
        root.classList.remove('theme-transition')
      }, 300)
    } catch { }
    // Asegurar que siempre se establezca el color seleccionado
    const colorToUse = forceDefaultSelectedColor ? defaultSelectedColor : selectedColor
    root.setAttribute("data-selected", colorToUse)
  }, [selectedColor, forceDefaultSelectedColor, defaultSelectedColor])

  const value = {
    theme: "dark" as Theme,
    selectedColor,
    setTheme: () => {
      // No permitir cambio de tema, siempre oscuro
    },
    setSelectedColor: (color: SelectedColor) => {
      // Si forceDefaultSelectedColor está activo, no permitir cambios
      if (forceDefaultSelectedColor) {
        return
      }
      localStorage.setItem(selectedColorKey, color)
      setSelectedColor(color)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider")

  return context
}
