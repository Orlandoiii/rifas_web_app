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

  const [selectedColor, setSelectedColor] = React.useState<SelectedColor>(
    () => (localStorage.getItem(selectedColorKey) as SelectedColor) || defaultSelectedColor
  )

  useEffect(() => {
    if (forceDefaultSelectedColor) {
      localStorage.setItem(selectedColorKey, defaultSelectedColor)
      setSelectedColor(defaultSelectedColor)
    }
  
  }, [])

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
    root.setAttribute("data-selected", selectedColor)
  }, [selectedColor])

  const value = {
    theme: "dark" as Theme,
    selectedColor,
    setTheme: () => {
      // No permitir cambio de tema, siempre oscuro
    },
    setSelectedColor: (color: SelectedColor) => {
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
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
