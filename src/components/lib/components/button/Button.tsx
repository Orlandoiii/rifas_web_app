import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils"


const baseStyles = [
  "inline-flex items-center justify-center whitespace-nowrap",
  "rounded-lg text-sm font-medium",
  "transition-all duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50",
  "active:scale-95"
].join(" ")

const variantStyles = {
  default: [
    // Usando variables dinámicas de color seleccionado
    "bg-selected text-white",
    "hover:bg-selected-hover hover:scale-105",
    "shadow"
  ].join(" "),

  destructive: [
    "bg-state-error text-white",
    "hover:bg-state-error hover:scale-105",
    "shadow-sm"
  ].join(" "),

  outline: [
    // Usando variables dinámicas de color seleccionado
    "border-2 border-selected text-selected bg-transparent",
    "hover:bg-selected hover:text-white hover:scale-105",
    "shadow-sm"
  ].join(" "),

  secondary: [
    "bg-bg-secondary text-text-primary border border-border-light",
    "hover:bg-bg-tertiary hover:scale-105",
    "shadow-sm"
  ].join(" "),

  ghost: [
    "bg-transparent text-text-primary",
    "hover:bg-bg-secondary hover:scale-105"
  ].join(" "),

  link: [
    // Usando variables dinámicas de color seleccionado
    "bg-transparent text-selected",
    "hover:underline hover:scale-105",
    "underline-offset-4"
  ].join(" "),
}

const sizeStyles = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-12 rounded-lg px-8",
  xl: "h-14 rounded-xl px-10 text-base",
  icon: "h-10 w-10",
}

const defaultVariants = {
  variant: "default",
  size: "default",
} as const

const buttonVariants = cva(baseStyles, {
  variants: {
    variant: variantStyles,
    size: sizeStyles,
  },
  defaultVariants,
})





export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }