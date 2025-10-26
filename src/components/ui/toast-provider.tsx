"use client"

import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      {/* ✅ Viewport positioned responsively */}
      <ToastPrimitive.Viewport
        className={cn(
          "fixed z-[100] p-4",
          "bottom-4 right-4", // desktop
          "sm:bottom-4 sm:right-4", // small devices
          "max-sm:bottom-[env(safe-area-inset-bottom,16px)] max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-[90%]" // centered on mobile
        )}
      />
    </ToastPrimitive.Provider>
  )
}

export function useToast() {
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [type, setType] = React.useState<"success" | "error">("success")

  const showToast = (msg: string, variant: "success" | "error" = "success") => {
    setMessage(msg)
    setType(variant)
    setOpen(true)
  }

  const Toast = (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "z-[101] rounded-xl shadow-lg p-4 text-white font-medium w-full sm:w-80 animate-slide-up",
        "transition-all duration-300 ease-in-out",
        type === "success"
          ? "bg-gradient-to-r from-green-500 to-emerald-600"
          : "bg-gradient-to-r from-red-500 to-rose-600"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm sm:text-base">{message}</span>
        <ToastPrimitive.Close asChild>
          <button className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  )

  return { Toast, showToast }
}
