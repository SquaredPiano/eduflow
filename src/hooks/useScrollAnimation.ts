"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimationOptions {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

/**
 * Custom hook for GSAP ScrollTrigger animations
 * Follows Single Responsibility Principle - handles only scroll-based animations
 */
export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  animation: (element: T) => gsap.core.Timeline | gsap.core.Tween,
  options: ScrollAnimationOptions = {}
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      const tl = animation(elementRef.current!);
      
      ScrollTrigger.create({
        trigger: options.trigger || elementRef.current,
        start: options.start || "top 80%",
        end: options.end || "bottom 20%",
        scrub: options.scrub ?? false,
        markers: options.markers ?? false,
        onEnter: options.onEnter,
        onLeave: options.onLeave,
        onEnterBack: options.onEnterBack,
        onLeaveBack: options.onLeaveBack,
        animation: tl,
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [animation, options]);

  return elementRef;
}

/**
 * Fade in animation on scroll
 */
export function useFadeInScroll(duration = 1) {
  return useScrollAnimation(
    (el) => gsap.from(el, {
      opacity: 0,
      y: 50,
      duration,
      ease: "power2.out",
    }),
    { start: "top 85%" }
  );
}

/**
 * Slide in from left animation
 */
export function useSlideInLeft(duration = 1) {
  return useScrollAnimation(
    (el) => gsap.from(el, {
      opacity: 0,
      x: -100,
      duration,
      ease: "power3.out",
    }),
    { start: "top 80%" }
  );
}

/**
 * Slide in from right animation
 */
export function useSlideInRight(duration = 1) {
  return useScrollAnimation(
    (el) => gsap.from(el, {
      opacity: 0,
      x: 100,
      duration,
      ease: "power3.out",
    }),
    { start: "top 80%" }
  );
}

/**
 * Scale up animation on scroll
 */
export function useScaleUpScroll(duration = 0.8) {
  return useScrollAnimation(
    (el) => gsap.from(el, {
      opacity: 0,
      scale: 0.8,
      duration,
      ease: "back.out(1.7)",
    }),
    { start: "top 80%" }
  );
}

/**
 * Parallax scroll effect
 */
export function useParallaxScroll(speed = 0.5) {
  return useScrollAnimation(
    (el) => gsap.to(el, {
      y: () => window.innerHeight * speed,
      ease: "none",
    }),
    { 
      start: "top bottom",
      end: "bottom top",
      scrub: true 
    }
  );
}

/**
 * Stagger children animation
 */
export function useStaggerChildren(duration = 0.6, stagger = 0.1) {
  return useScrollAnimation(
    (el) => {
      const children = el.children;
      return gsap.from(children, {
        opacity: 0,
        y: 30,
        duration,
        stagger,
        ease: "power2.out",
      });
    },
    { start: "top 85%" }
  );
}
