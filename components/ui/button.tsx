import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "tw-:inline-flex tw-:items-center tw-:justify-center tw-:gap-2 tw-:whitespace-nowrap tw-:rounded-md tw-:text-sm tw-:font-medium tw-:transition-colors tw-:focus-visible:outline-none tw-:focus-visible:ring-1 tw-:focus-visible:ring-neutral-950 tw-:disabled:pointer-events-none tw-:disabled:opacity-50 tw-:[&_svg]:pointer-events-none tw-:[&_svg]:size-4 tw-:[&_svg]:shrink-0 tw-:dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        default:
          "tw-:bg-neutral-900 tw-:text-neutral-50 tw-:shadow tw-:hover:bg-neutral-900/90 tw-:dark:bg-neutral-50 tw-:dark:text-neutral-900 tw-:dark:hover:bg-neutral-50/90",
        destructive:
          "tw-:bg-red-500 tw-:text-neutral-50 tw-:shadow-sm tw-:hover:bg-red-500/90 tw-:dark:bg-red-900 tw-:dark:text-neutral-50 tw-:dark:hover:bg-red-900/90",
        outline:
          "tw-:border tw-:border-neutral-200 tw-:bg-white tw-:shadow-sm tw-:hover:bg-neutral-100 tw-:hover:text-neutral-900 tw-:dark:border-neutral-800 tw-:dark:bg-neutral-950 tw-:dark:hover:bg-neutral-800 tw-:dark:hover:text-neutral-50",
        secondary:
          "tw-:bg-neutral-100 tw-:text-neutral-900 tw-:shadow-sm tw-:hover:bg-neutral-100/80 tw-:dark:bg-neutral-800 tw-:dark:text-neutral-50 tw-:dark:hover:bg-neutral-800/80",
        ghost: "tw-:hover:bg-neutral-100 tw-:hover:text-neutral-900 tw-:dark:hover:bg-neutral-800 tw-:dark:hover:text-neutral-50",
        link: "tw-:text-neutral-900 tw-:underline-offset-4 tw-:hover:underline tw-:dark:text-neutral-50",
      },
      size: {
        default: "tw-:h-9 tw-:px-4 tw-:py-2",
        sm: "tw-:h-8 tw-:rounded-md tw-:px-3 tw-:text-xs",
        lg: "tw-:h-10 tw-:rounded-md tw-:px-8",
        icon: "tw-:h-9 tw-:w-9",
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
