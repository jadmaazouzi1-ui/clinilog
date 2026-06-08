"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Final numeric value to count up to. */
  to: number;
  /** Duration in ms. Default 1200. */
  duration?: number;
  /** Number of decimal places. Default 0. */
  decimals?: number;
  /** Optional prefix and suffix string. */
  prefix?: string;
  suffix?: string;
  /** Zero-pad the integer portion to this width. */
  padWidth?: number;
  /** className applied to the rendered span. */
  className?: string;
  /** style applied to the rendered span. */
  style?: React.CSSProperties;
}

/**
 * Counts up from zero to `to` when first scrolled into view.
 * Uses requestAnimationFrame + IntersectionObserver.
 */
export default function CountUp({
  to,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  padWidth,
  className,
  style,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  // Reset to zero on `to` changes so the count re-animates if data updates
  useEffect(() => {
    setValue(0);
    setStarted(false);
  }, [to]);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let raf = 0;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(eased * to);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setValue(to);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration]);

  let display = value.toFixed(decimals);
  if (padWidth) {
    const [intPart, decPart] = display.split(".");
    const padded = intPart.padStart(padWidth, "0");
    display = decPart ? `${padded}.${decPart}` : padded;
  }

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
