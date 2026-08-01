/**
 * ARCHITECTURAL COMPONENT: Collapsible
 * Role: Diagnostic-aware collapsible UI primitive for system dashboards.
 * Integration: Connects to src/lib/collapsible-telemetry.ts for state tracking and health reporting.
 */

"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { trackCollapsibleState } from "@/lib/collapsible-telemetry"

function Collapsible({
  onOpenChange,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const handleOpenChange = (open: boolean) => {
    trackCollapsibleState(open);
    onOpenChange?.(open);
  };

  return (
    <CollapsiblePrimitive.Root 
      data-slot="collapsible" 
      onOpenChange={handleOpenChange}
      {...props} 
    />
  )
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }