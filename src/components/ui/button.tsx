import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "neo-button bg-gradient-primary text-primary-foreground border-0",
        destructive: "neo-button bg-gradient-to-br from-destructive to-destructive-pressed text-destructive-foreground border-0 hover:from-destructive-pressed hover:to-destructive",
        outline: "neo-button bg-gradient-surface text-foreground border border-border hover:bg-gradient-pressed",
        secondary: "neo-button bg-gradient-to-br from-secondary to-secondary-pressed text-secondary-foreground border-0 hover:from-secondary-pressed hover:to-secondary",
        ghost: "rounded-xl hover:bg-surface/50 hover:text-foreground transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline rounded-xl p-2",
        neo: "neo-button bg-gradient-surface text-foreground border border-border",
        "neo-primary": "neo-button bg-gradient-primary text-primary-foreground border-0",
        "neo-success": "neo-button bg-gradient-to-br from-success to-success text-success-foreground border-0",
      },
      size: {
        default: "h-11 px-6 py-3 rounded-xl",
        sm: "h-9 px-4 py-2 rounded-lg text-xs",
        lg: "h-13 px-8 py-4 rounded-2xl text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
