import { gsap, MOTION, ScrollTrigger } from "./gsap";

const REDUCE = "(prefers-reduced-motion: reduce)";
const NO_REDUCE = "(prefers-reduced-motion: no-preference)";
const FINE_POINTER =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

type Cleanup = () => void;

type Quick = ReturnType<typeof gsap.quickTo>;

function qsa<T extends Element>(
  selector: string,
  root: ParentNode = document,
): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function noop(): void {}

function addMotionClass(elements: Element[]) {
  elements.forEach((element) => element.classList.add("motion-animating"));
}

function removeMotionClass(elements: Element[]) {
  elements.forEach((element) => element.classList.remove("motion-animating"));
}

function markVisible(...elements: Element[]) {
  elements.forEach((element) => {
    if (element instanceof HTMLElement) element.dataset.visible = "true";
  });
}

function clearRevealProps(elements: Element[]) {
  if (elements.length === 0) return;
  gsap.set(elements, { clearProps: "transform,opacity,willChange" });
}

/**
 * Scroll-triggered reveals. Groups and staggers animate their children;
 * standalone `[data-reveal]` elements animate themselves.
 */
export function initScrollReveals(root: ParentNode = document): Cleanup {
  const singles = qsa<HTMLElement>("[data-reveal]", root).filter(
    (element) =>
      element.dataset.visible !== "true" &&
      !element.closest("[data-reveal-group], [data-reveal-stagger]"),
  );
  const groups = qsa<HTMLElement>("[data-reveal-group]", root).filter(
    (element) => element.dataset.visible !== "true",
  );
  const staggers = qsa<HTMLElement>("[data-reveal-stagger]", root).filter(
    (element) => element.dataset.visible !== "true",
  );

  if (singles.length === 0 && groups.length === 0 && staggers.length === 0) {
    return noop;
  }

  const mm = gsap.matchMedia();

  mm.add(NO_REDUCE, () => {
    singles.forEach((element) => {
      const delay = Number(element.dataset.revealDelay ?? 0) / 1000;

      gsap.fromTo(
        element,
        {
          y: MOTION.revealDistance,
          opacity: 0,
          willChange: "transform, opacity",
        },
        {
          y: 0,
          opacity: 1,
          duration: MOTION.reveal,
          delay,
          ease: MOTION.ease,
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
          onStart: () => addMotionClass([element]),
          onComplete: () => {
            markVisible(element);
            removeMotionClass([element]);
            clearRevealProps([element]);
          },
        },
      );
    });

    const animateGroup = (
      group: HTMLElement,
      distance: number,
      stagger: number,
    ) => {
      const children = Array.from(group.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );

      if (children.length === 0) {
        markVisible(group);
        return;
      }

      gsap.fromTo(
        children,
        { y: distance, opacity: 0, willChange: "transform, opacity" },
        {
          y: 0,
          opacity: 1,
          duration: MOTION.reveal,
          stagger,
          ease: MOTION.ease,
          scrollTrigger: {
            trigger: group,
            start: "top 85%",
            once: true,
          },
          onStart: () => addMotionClass(children),
          onComplete: () => {
            markVisible(group);
            removeMotionClass(children);
            clearRevealProps(children);
          },
        },
      );
    };

    groups.forEach((group) =>
      animateGroup(group, MOTION.cardDistance, MOTION.cardStagger),
    );
    staggers.forEach((group) =>
      animateGroup(group, MOTION.revealDistance, 0.08),
    );
  });

  mm.add(REDUCE, () => {
    markVisible(...singles, ...groups, ...staggers);
  });

  return () => mm.revert();
}

/** Hero entrance, ambient fade, glow parallax and the preview playhead loop. */
export function initHeroIntro(): Cleanup {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero || hero.dataset.heroDone === "true") return noop;

  const lines = qsa<HTMLElement>("[data-hero-line]", hero);
  const fades = qsa<HTMLElement>("[data-hero-fade]", hero);
  const previews = qsa<HTMLElement>("[data-hero-preview]", hero);
  const glows = qsa<HTMLElement>("[data-glow-hero]", hero);
  const drifters = qsa<HTMLElement>("[data-glow-drift]", hero);
  const playhead = hero.querySelector<HTMLElement>("[data-playhead]");
  const parallax = qsa<HTMLElement>("[data-glow-parallax]", hero);

  if (
    lines.length === 0 &&
    fades.length === 0 &&
    previews.length === 0 &&
    glows.length === 0
  ) {
    return noop;
  }

  const mm = gsap.matchMedia();
  let resizeObserver: ResizeObserver | undefined;

  const finish = () => {
    [...lines, ...fades, ...previews].forEach((element) => {
      element.dataset.heroDone = "true";
    });
    glows.forEach((element) => {
      element.dataset.glowDone = "true";
    });
    hero.dataset.heroDone = "true";

    clearRevealProps([...lines, ...fades, ...previews]);
    if (glows.length > 0) {
      gsap.set(glows, { clearProps: "opacity,willChange" });
    }
  };

  mm.add(NO_REDUCE, () => {
    const timeline = gsap.timeline({
      defaults: { ease: MOTION.ease },
      onComplete: finish,
    });

    timeline.to(glows, { opacity: 1, duration: 1.6, ease: MOTION.easeSoft }, 0);

    timeline.fromTo(
      lines,
      {
        y: 28,
        opacity: 0,
        clipPath: "inset(0 0 100% 0)",
        willChange: "transform, opacity, clip-path",
      },
      {
        y: 0,
        opacity: 1,
        clipPath: "inset(0 0 0% 0)",
        duration: 0.9,
        stagger: 0.08,
      },
      0.1,
    );

    const headlineEnd = 0.1 + 0.9 + Math.max(0, lines.length - 1) * 0.08;

    timeline.fromTo(
      fades,
      { y: 20, opacity: 0, willChange: "transform, opacity" },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
      },
      headlineEnd + 0.25,
    );

    timeline.fromTo(
      previews,
      {
        y: 40,
        opacity: 0,
        scale: 0.985,
        willChange: "transform, opacity",
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.1,
      },
      "<0.15",
    );

    const startPlayhead = () => {
      if (!playhead) return;
      const parent = playhead.parentElement;
      if (!parent) return;

      const travel = () => Math.max(0, parent.clientWidth * 0.45);
      const tween = gsap.fromTo(
        playhead,
        { x: 0 },
        {
          x: travel,
          duration: 14,
          ease: "none",
          repeat: -1,
          repeatRefresh: true,
        },
      );

      resizeObserver = new ResizeObserver(() => {
        tween.invalidate();
      });
      resizeObserver.observe(parent);
    };

    timeline.call(startPlayhead);

    timeline.eventCallback("onComplete", () => {
      finish();
      if (drifters.length > 0) {
        gsap.to(drifters, {
          x: 20,
          y: 20,
          duration: 12,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    });

    if (parallax.length > 0) {
      gsap.to(parallax, {
        y: 68,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
  });

  mm.add(REDUCE, () => {
    finish();
    if (playhead) gsap.set(playhead, { clearProps: "transform" });
  });

  return () => {
    resizeObserver?.disconnect();
    mm.revert();
  };
}

/** Transparent nav at the top; glass tint after the page scrolls. */
export function initNavbarMotion(): Cleanup {
  const nav = document.querySelector<HTMLElement>("[data-nav-intro]");
  if (!nav) return noop;

  const mm = gsap.matchMedia();
  let scrolled = window.scrollY > 24;

  const applyScrolled = (next: boolean) => {
    nav.dataset.scrolled = String(next);
  };

  const onScroll = () => {
    const next = window.scrollY > 24;
    if (next === scrolled) return;
    scrolled = next;
    applyScrolled(next);
  };

  applyScrolled(scrolled);
  window.addEventListener("scroll", onScroll, { passive: true });

  mm.add(NO_REDUCE, () => {
    gsap.fromTo(
      nav,
      { y: -8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: MOTION.easeSoft,
        onComplete: () => {
          nav.dataset.navDone = "true";
          gsap.set(nav, { clearProps: "transform,opacity" });
        },
      },
    );
  });

  mm.add(REDUCE, () => {
    nav.dataset.navDone = "true";
  });

  return () => {
    window.removeEventListener("scroll", onScroll);
    mm.revert();
  };
}

/** Cursor spotlight for glass cards, delegated so it survives route changes. */
export function initSpotlight(): Cleanup {
  const mm = gsap.matchMedia();

  mm.add(FINE_POINTER, () => {
    type Spot = { x: Quick; y: Quick; proxy: { x: number; y: number } };
    const spots = new WeakMap<HTMLElement, Spot>();

    const getSpot = (element: HTMLElement): Spot => {
      const existing = spots.get(element);
      if (existing) return existing;

      const proxy = { x: 0, y: 0 };
      const spot: Spot = {
        proxy,
        x: gsap.quickTo(proxy, "x", {
          duration: 0.5,
          ease: MOTION.easeSoft,
          onUpdate: () => {
            element.style.setProperty("--mx", `${proxy.x}px`);
          },
        }),
        y: gsap.quickTo(proxy, "y", {
          duration: 0.5,
          ease: MOTION.easeSoft,
          onUpdate: () => {
            element.style.setProperty("--my", `${proxy.y}px`);
          },
        }),
      };

      spots.set(element, spot);
      return spot;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>("[data-spotlight]");
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const spot = getSpot(element);

      if (spot.proxy.x === 0 && spot.proxy.y === 0) {
        spot.proxy.x = x;
        spot.proxy.y = y;
        element.style.setProperty("--mx", `${x}px`);
        element.style.setProperty("--my", `${y}px`);
      }

      spot.x(x);
      spot.y(y);
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => document.removeEventListener("pointermove", onPointerMove);
  });

  return () => mm.revert();
}

/** A 4px magnetic pull on primary/secondary buttons. */
export function initMagneticButtons(): Cleanup {
  const mm = gsap.matchMedia();

  mm.add(FINE_POINTER, () => {
    type Magnet = { x: Quick; y: Quick };
    const magnets = new WeakMap<HTMLElement, Magnet>();

    const getMagnet = (element: HTMLElement): Magnet => {
      const existing = magnets.get(element);
      if (existing) return existing;

      const proxy = { x: 0, y: 0 };
      const setX = () => {
        element.style.setProperty("--mag-x", `${proxy.x}px`);
      };
      const setY = () => {
        element.style.setProperty("--mag-y", `${proxy.y}px`);
      };
      const magnet: Magnet = {
        x: gsap.quickTo(proxy, "x", {
          duration: 0.5,
          ease: MOTION.easeSoft,
          onUpdate: setX,
        }),
        y: gsap.quickTo(proxy, "y", {
          duration: 0.5,
          ease: MOTION.easeSoft,
          onUpdate: setY,
        }),
      };

      magnets.set(element, magnet);
      return magnet;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>("[data-magnetic]");
      if (!element) return;
      if (
        element.matches(":disabled") ||
        element.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 4;
      const y = ((event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 4;
      const magnet = getMagnet(element);

      magnet.x(Math.max(-4, Math.min(4, x)));
      magnet.y(Math.max(-4, Math.min(4, y)));
    };

    const onPointerOut = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>("[data-magnetic]");
      if (!element) return;

      const related = event.relatedTarget;
      if (related instanceof Node && element.contains(related)) return;

      const magnet = getMagnet(element);
      magnet.x(0);
      magnet.y(0);
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
    };
  });

  return () => mm.revert();
}

/** Small, looping plugin motifs. Only one runs while it is on screen. */
export function initPluginLoops(): Cleanup {
  const motifs = qsa<HTMLElement>("[data-motif]");
  if (motifs.length === 0) return noop;

  const mm = gsap.matchMedia();

  mm.add(NO_REDUCE, () => {
    type Tween = ReturnType<typeof gsap.to>;
    const cleanups: Cleanup[] = [];

    motifs.forEach((motif) => {
      const tweens: Tween[] = [];
      const kind = motif.dataset.motif;

      if (kind === "gaming") {
        const highlight = motif.querySelector<HTMLElement>(
          "[data-gaming-highlight]",
        );
        const playheads = qsa<HTMLElement>("[data-gaming-playhead]", motif);

        if (highlight) {
          gsap.set(highlight, { opacity: 0.7 });
          tweens.push(
            gsap.to(highlight, {
              opacity: 1,
              duration: 2,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              paused: true,
            }),
          );
        }

        if (playheads.length > 0) {
          gsap.set(playheads, { x: -4 });
          tweens.push(
            gsap.to(playheads, {
              x: 4,
              duration: 4,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              paused: true,
            }),
          );
        }
      }

      if (kind === "podcast") {
        const bars = qsa<HTMLElement>("[data-podcast-bar]", motif);
        if (bars.length > 0) {
          gsap.set(bars, { transformOrigin: "center", scaleY: 0.6 });
          tweens.push(
            gsap.to(bars, {
              scaleY: 1,
              duration: 1.2,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              stagger: { each: 0.08, from: "start" },
              paused: true,
            }),
          );
        }
      }

      if (kind === "cinematic") {
        const perf = qsa<HTMLElement>("[data-cinematic-perf]", motif);
        const grade = motif.querySelector<HTMLElement>(
          "[data-cinematic-grade]",
        );

        if (perf.length > 0) {
          gsap.set(perf, { x: -1.5 });
          tweens.push(
            gsap.to(perf, {
              x: 1.5,
              duration: 7,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              paused: true,
            }),
          );
        }

        if (grade) {
          gsap.set(grade, { opacity: 0.85 });
          tweens.push(
            gsap.to(grade, {
              opacity: 1,
              duration: 9,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              paused: true,
            }),
          );
        }
      }

      if (tweens.length === 0) return;

      const trigger = ScrollTrigger.create({
        trigger: motif,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          tweens.forEach((tween) => {
            if (self.isActive) tween.play();
            else tween.pause();
          });
        },
      });

      if (trigger.isActive) {
        tweens.forEach((tween) => tween.play());
      }

      cleanups.push(() => {
        trigger.kill();
        tweens.forEach((tween) => tween.kill());
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  });

  return () => mm.revert();
}

/** Used by the reduced-motion branch and the no-JS fallback. */
export function markFinalStates(root: ParentNode = document): void {
  qsa<HTMLElement>("[data-reveal]", root).forEach((element) => {
    element.dataset.visible = "true";
  });
  qsa<HTMLElement>("[data-reveal-group], [data-reveal-stagger]", root).forEach(
    (element) => {
      element.dataset.visible = "true";
    },
  );
  qsa<HTMLElement>(
    "[data-hero-line], [data-hero-fade], [data-hero-preview]",
    root,
  ).forEach((element) => {
    element.dataset.heroDone = "true";
  });
  qsa<HTMLElement>("[data-glow-hero]", root).forEach((element) => {
    element.dataset.glowDone = "true";
  });
  qsa<HTMLElement>("[data-nav-intro]", root).forEach((element) => {
    element.dataset.navDone = "true";
  });
}
