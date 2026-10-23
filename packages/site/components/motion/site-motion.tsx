"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";
import {
  initHeroIntro,
  initMagneticButtons,
  initNavbarMotion,
  initPluginLoops,
  initScrollReveals,
  initSpotlight,
} from "@/lib/motion";

declare global {
  interface Window {
    __splicMotionReady?: boolean;
  }
}

type Cleanup = () => void;

/**
 * Wait for React to finish hydrating before touching the DOM. Mutating
 * animated elements during hydration makes React report attribute
 * mismatches (GSAP writes inline styles), even from an effect.
 */
function afterHydration(callback: () => void): Cleanup {
  let cancelled = false;
  let timer = 0;

  const run = () => {
    timer = window.setTimeout(() => {
      if (!cancelled) callback();
    }, 150);
  };

  if (document.readyState === "complete") {
    run();
  } else {
    window.addEventListener("load", run, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    window.clearTimeout(timer);
  };
}

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups: Cleanup[] = [];

    const cancel = afterHydration(() => {
      cleanups.push(
        initNavbarMotion(),
        initSpotlight(),
        initMagneticButtons(),
      );
      window.__splicMotionReady = true;
    });

    return () => {
      cancel();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    const cleanups: Cleanup[] = [];

    const cancel = afterHydration(() => {
      cleanups.push(
        initScrollReveals(),
        initHeroIntro(),
        initPluginLoops(),
      );

      const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      const timer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        window.clearTimeout(timer);
      });
    });

    return () => {
      cancel();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return null;
}
