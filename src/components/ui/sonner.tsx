/**
 * ARCHITECTURAL COMPONENT: Sonner Toaster
 * Role: Diagnostic-aware notification system for the application.
 * Integration: Connects to src/lib/sonner-telemetry.ts for system-wide health reporting.
 */

"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { useEffect } from "react"
import { reportComponentMount } from "@/lib/sonner-telemetry"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  useEffect(() => {
    reportComponentMount("SonnerToaster")
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }