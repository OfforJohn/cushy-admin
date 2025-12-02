"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-12 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50",
        // Track color: green if checked, red if unchecked
        "data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-red-600",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200",
          // Thumb slides to the right when checked
          "data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
