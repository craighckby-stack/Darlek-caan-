/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/ui/aspect-ratio.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

"use client";

/**
 * ARCHITECTURAL COMPONENT: AspectRatio
 * Role: Diagnostic-aware wrapper for Radix AspectRatio primitive.
 * Integration: Connects to src/lib/component-telemetry.ts for lifecycle monitoring.
 */

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import { useEffect } from "react";
import { trackComponentLifecycle } from "@/lib/component-telemetry";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  useEffect(() => {
    trackComponentLifecycle("AspectRatio", "mount");
    return () => trackComponentLifecycle("AspectRatio", "unmount");
  }, []);

  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };