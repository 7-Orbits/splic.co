"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface SmoothScrollControls {
  stop: () => void;
  start: () => void;
}

const noop = () => {};

const SmoothScrollContext = createContext<SmoothScrollControls>({
  stop: noop,
  start: noop,
});

export function useSmoothScroll(): SmoothScrollControls {
  return useContext(SmoothScrollContext);
}

const anchorEasing = (time: number) => 1 - Math.pow(1 - time, 4);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const stoppedCount = useRef(0);
  const lastPathname = useRef<string | null>(null);
  const pathname = usePathname();

  const stop = useCallback(() => {
    stoppedCount.current += 1;
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    stoppedCount.current = Math.max(0, stoppedCount.current - 1);
    if (stoppedCount.current === 0) lenisRef.current?.start();
  }, []);

  const controls = useMemo(() => ({ stop, start }), [stop, start]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
      autoRaf: false,
    });

    lenisRef.current = lenis;

    if (stoppedCount.current > 0) lenis.stop();

    const syncScrollTrigger = () => ScrollTrigger.update();
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", syncScrollTrigger);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    let destroyed = false;
    document.fonts?.ready.then(() => {
      if (!destroyed) ScrollTrigger.refresh();
    });

    return () => {
      destroyed = true;
      lenis.off("scroll", syncScrollTrigger);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (lastPathname.current === null) {
      lastPathname.current = pathname;
      return;
    }
    if (lastPathname.current === pathname) return;

    lastPathname.current = pathname;
    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      if (anchor.classList.contains("skip-link")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname || !url.hash) return;

      let id = url.hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        return;
      }

      const section = document.getElementById(id);
      const lenis = lenisRef.current;
      if (!section || !lenis) return;

      event.preventDefault();
      const targetY = section.getBoundingClientRect().top + window.scrollY;
      lenis.scrollTo(targetY, {
        offset: -88,
        duration: 1.2,
        easing: anchorEasing,
      });
      window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <SmoothScrollContext.Provider value={controls}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
