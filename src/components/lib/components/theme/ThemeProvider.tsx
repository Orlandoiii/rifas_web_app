import * as React from "react"

type Theme = "dark" | "light" | "system"
type SelectedColor = "coral" | "mint" | "electric" | "binance"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultSelectedColor?: SelectedColor
  storageKey?: string
  selectedColorKey?: string
}

interface ThemeProviderState {
  theme: Theme
  selectedColor: SelectedColor
  setTheme: (theme: Theme) => void
  setSelectedColor: (color: SelectedColor) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  selectedColor: "coral",
  setTheme: () => null,
  setSelectedColor: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultSelectedColor = "coral",
  storageKey = "ui-theme",
  selectedColorKey = "ui-selected-color",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  const [selectedColor, setSelectedColor] = React.useState<SelectedColor>(
    () => (localStorage.getItem(selectedColorKey) as SelectedColor) || defaultSelectedColor
  )

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      root.setAttribute("data-theme", systemTheme)
    } else {
      root.classList.add(theme)
      root.setAttribute("data-theme", theme)
    }
  }, [theme])

  React.useEffect(() => {
    const root = window.document.documentElement
    root.setAttribute("data-selected", selectedColor)
  }, [selectedColor])

  const value = {
    theme,
    selectedColor,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
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
