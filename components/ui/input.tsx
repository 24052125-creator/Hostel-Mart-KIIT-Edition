import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "tw-:flex tw-:h-9 tw-:w-full tw-:rounded-md tw-:border tw-:border-neutral-200 tw-:bg-transparent tw-:px-3 tw-:py-1 tw-:text-base tw-:shadow-sm tw-:transition-colors tw-:file:border-0 tw-:file:bg-transparent tw-:file:text-sm tw-:file:font-medium tw-:file:text-neutral-950 tw-:placeholder:text-neutral-500 tw-:focus-visible:outline-none tw-:focus-visible:ring-1 tw-:focus-visible:ring-neutral-950 tw-:disabled:cursor-not-allowed tw-:disabled:opacity-50 tw-:md:text-sm tw-:dark:border-neutral-800 tw-:dark:file:text-neutral-50 tw-:dark:placeholder:text-neutral-400 tw-:dark:focus-visible:ring-neutral-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
