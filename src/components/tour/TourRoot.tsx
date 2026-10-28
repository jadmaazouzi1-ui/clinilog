"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { MODULE_BY_ID } from "@/lib/tour/modules";
import { autoStartAdvisor, autoStartFor, resumeFor } from "@/lib/tour/logic";
import { getTour, loadTour, openHelp, startTour, useTour } from "./store";

// The spotlight and the Help Center are only downloaded when one is opened.
const Spotlight = dynamic(() => import("./Spotlight"), { ssr: false });
const HelpCenter = dynamic(() => import("./HelpCenter"), { ssr: false });

function stepPage(id: string, step: number): string | null {
  return MODULE_BY_ID[id]?.steps[step]?.page ?? null;
}

/** Mounted once per page by AppShell. Renders nothing until a tour or the
 *  Help Center is open. */
export default function TourRoot() {
  const pathname = usePathname();
  const router = useRouter();
  const { active, helpOpen, loaded } = useTour();

  useEffect(() => {
    let cancelled = false;
    loadTour().then(() => {
      if (cancelled) return;
      const { rows, ctx, active: current, signedIn, offerVisible } = getTour();
      if (!signedIn || current) return;
      // Nothing starts by itself while the tour card is waiting for an answer.
      const offerOpen = offerVisible && rows.some((r) => r.module_id === "_offer" && r.status === "in_progress");
      if (offerOpen) return;
      const resume = resumeFor(pathname, rows, ctx, stepPage);
      if (resume) return startTour(resume.id, resume.step);
      const auto = autoStartFor(pathname, rows, ctx);
      if (auto) startTour(auto, 0);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // A replay started from another page, or a step that lives on the next
  // page: go there. The spotlight picks the step up once the page renders.
  useEffect(() => {
    if (!active) return;
    const page = stepPage(active.id, active.step);
    if (page && page !== "*" && page !== pathname) router.push(page);
  }, [active, pathname, router]);

  useEffect(() => {
    function onAdvisorOpened() {
      const { rows, ctx, active: current, signedIn } = getTour();
      if (signedIn && !current && autoStartAdvisor(rows, ctx)) {
        // Let the drawer finish sliding in before measuring its controls.
        setTimeout(() => startTour("advisor", 0), 350);
      }
    }
    window.addEventListener("cliniclog:advisor-opened", onAdvisorOpened);
    window.addEventListener("cliniclog:open-help", openHelp);
    return () => {
      window.removeEventListener("cliniclog:advisor-opened", onAdvisorOpened);
      window.removeEventListener("cliniclog:open-help", openHelp);
    };
  }, []);

  const current = active ? MODULE_BY_ID[active.id]?.steps[active.step] : null;
  const announcement = active && current
    ? `${MODULE_BY_ID[active.id].title} tour, step ${active.step + 1} of ${MODULE_BY_ID[active.id].steps.length}: ${current.title}`
    : "";

  const showSpotlight = loaded && active && (stepPage(active.id, active.step) === pathname || stepPage(active.id, active.step) === "*");

  return (
    <>
      <div className="sr-only-live" aria-live="polite" aria-atomic="true">{announcement}</div>
      {showSpotlight && <Spotlight key={`${active.id}:${active.step}`} />}
      {helpOpen && <HelpCenter />}
    </>
  );
}
