import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

function register() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  registered = true;
}

register();

export const MOTION = {
  reveal: 0.8,
  revealDistance: 24,
  cardDistance: 32,
  cardStagger: 0.09,
  ease: "power3.out",
  easeSoft: "power2.out",
} as const;

export { gsap, ScrollTrigger, useGSAP };
