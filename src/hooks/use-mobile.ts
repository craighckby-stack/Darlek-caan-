/**
 * ARCHITECTURAL VIEWPORT MONITOR
 * Role: Provides diagnostic-aware viewport tracking and mobile-breakpoint detection.
 * Integration: Connects to the system diagnostic context to report layout-related state changes.
 * Dependencies: src/lib/viewport-telemetry.ts
 */

import * as React from "react";
import { useViewportTelemetry } from "@/lib/viewport-telemetry";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const { reportViewportChange } = useViewportTelemetry();

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = (e: MediaQueryListEvent) => {
      const newState = e.matches;
      setIsMobile(newState);
      reportViewportChange(newState, window.innerWidth);
    };

    // Initial sync
    const initialState = mql.matches;
    setIsMobile(initialState);
    reportViewportChange(initialState, window.innerWidth);

    mql.addEventListener("change", onChange);
    
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, [reportViewportChange]);

  return isMobile;
}