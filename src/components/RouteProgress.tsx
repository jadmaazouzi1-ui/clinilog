"use client";

import { useEffect, useState } from "react";
import { useLinkStatus } from "next/link";

/* ──────────────────────────────────────────────────────────────────────────
   Route progress: a slim bar at the very top of the viewport while a
   navigation is in flight.

   The signal comes from useLinkStatus, which only reports pending inside a
   <Link>. So each navigation link drops a <LinkPending /> marker in, and
   those markers publish into this tiny store, which the bar subscribes to.
   That means the bar reflects a real pending navigation rather than being
   animated on a timer after the page has already arrived.
   ────────────────────────────────────────────────────────────────────────── */

let pendingCount = 0;
const listeners = new Set<(v: boolean) => void>();

function publish() {
  const active = pendingCount > 0;
  listeners.forEach((l) => l(active));
}

function acquire() {
  pendingCount += 1;
  publish();
}

function release() {
  pendingCount = Math.max(0, pendingCount - 1);
  publish();
}

/** Drop inside a <Link> to report that link's pending state to the bar. */
export function LinkPending() {
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (!pending) return;
    acquire();
    return release;
  }, [pending]);

  return null;
}

export default function RouteProgress() {
  const [active, setActive] = useState(false);
  // Kept mounted briefly after completion so a fast navigation still reads as
  // a deliberate sweep rather than a flash.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    listeners.add(setActive);
    return () => {
      listeners.delete(setActive);
    };
  }, []);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 220);
    return () => clearTimeout(t);
  }, [active, visible]);

  if (!visible) return null;

  return (
    <div
      className={`route-progress${active ? "" : " is-done"}`}
      role="progressbar"
      aria-label="Loading page"
      aria-busy={active}
    >
      <span />
    </div>
  );
}
