import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ShareStoryModal from "./ShareStoryModal";

const STORIES = [
  {
    name: "Maria",
    initial: "M",
    color: "#00D4FF",
    undergrad: "UC Riverside",
    medSchool: "UCLA David Geffen School of Medicine",
    background: "Daughter of Mexican immigrants; first in her family to attend a four-year university. Worked 25 hours a week at the family restaurant throughout college.",
    quote: "My parents never knew what the MCAT was, but they knew what sacrifice looked like — and that taught me everything I needed. Every early morning study session was for the patients in my community who looked like me and had no one advocating for them. Getting that acceptance letter was the most surreal moment of my life.",
  },
  {
    name: "DeShawn",
    initial: "D",
    color: "#10B981",
    undergrad: "Howard University",
    medSchool: "Johns Hopkins School of Medicine",
    background: "Grew up in West Baltimore; first-generation college student raised by a single mother who worked as a home health aide.",
    quote: "I watched my mom care for sick people her whole career without anyone caring for her. I wanted to be the kind of doctor who changes that equation. Howard gave me the community and confidence I never knew I needed, and Johns Hopkins is where I'll learn to turn that purpose into practice.",
  },
  {
    name: "Priya",
    initial: "P",
    color: "#A78BFA",
    undergrad: "CUNY Brooklyn College",
    medSchool: "SUNY Downstate Health Sciences University",
    background: "Parents emigrated from Gujarat, India, and worked in a bodega. Commuted two hours each way to college while working weekends.",
    quote: "People told me CUNY wasn't a 'target school' for medicine. I used that as fuel. I shadowed in community health centers in Brooklyn and realized the underserved communities I grew up in desperately needed physicians who understood their lives. SUNY Downstate is exactly where I'm supposed to be.",
  },
  {
    name: "Carlos",
    initial: "C",
    color: "#F59E0B",
    undergrad: "UT El Paso",
    medSchool: "UT Health San Antonio Long School of Medicine",
    background: "Born and raised on the US-Mexico border; first-generation American and first in his family to pursue a professional degree.",
    quote: "Growing up on the border, I saw the health disparities between two communities separated by a river. My MCAT score didn't define me — my 300+ hours volunteering at a free clinic did. I'm going to practice medicine in El Paso because my community deserves doctors who never left.",
  },
  {
    name: "Aisha",
    initial: "A",
    color: "#FF4757",
    undergrad: "Morgan State University",
    medSchool: "University of Maryland School of Medicine",
    background: "HBCU graduate from Baltimore; first in her extended family to enter the medical pipeline. Navigated the application process entirely without a pre-med advisor.",
    quote: "I found out what AMCAS was from a YouTube video. There was no roadmap, no alumni network pointing me toward the right answer. But I figured it out one Google search at a time, and I'm proud of every step because I earned it without a blueprint. Now I'm building the blueprint for everyone who comes after me.",
  },
  {
    name: "Kevin",
    initial: "K",
    color: "#38BDF8",
    undergrad: "Cal State LA",
    medSchool: "UC San Francisco School of Medicine",
    background: "Filipino-American; parents worked as a nurse's aide and a factory worker. First in his family born in the United States.",
    quote: "My mom worked nights in a nursing home so I could study during the day. I never took a Kaplan course — I used free resources, Anki decks, and study groups in the library. Cal State LA gave me every opportunity I needed; I just had to take them. UCSF doesn't just want students from fancy schools — they want students with a real reason to be there.",
  },
  {
    name: "Fatima",
    initial: "F",
    color: "#6366F1",
    undergrad: "UMass Boston",
    medSchool: "Boston University School of Medicine",
    background: "Somali refugee family; arrived in the US at age 9. First person in her entire extended family to enter any healthcare profession.",
    quote: "I didn't speak English fluently until seventh grade. By junior year of college I had a 3.9 GPA and 500 clinical hours. Medicine chose me the day my little brother got sick and I realized I wanted to be the person in the room who knew what to do. Nothing about my path was easy, and that's exactly why I trust it.",
  },
  {
    name: "James",
    initial: "J",
    color: "#10B981",
    undergrad: "University of New Mexico",
    medSchool: "UNM School of Medicine",
    background: "Diné (Navajo Nation); grew up in a rural community with limited healthcare access. First in his family to leave the reservation for college.",
    quote: "On the Navajo Nation, the nearest hospital is sometimes two hours away. I've seen what that distance costs families. I almost quit sophomore year — the imposter syndrome was overwhelming. But my community kept me going. I'm going back to serve the people who raised me, and I'm taking everything I learn at UNM with me.",
  },
];

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  "#00D4FF": { bg: "rgba(0,212,255,0.1)", text: "#00D4FF", border: "rgba(0,212,255,0.25)" },
  "#10B981": { bg: "rgba(16,185,129,0.1)", text: "#10B981", border: "rgba(16,185,129,0.25)" },
  "#A78BFA": { bg: "rgba(167,139,250,0.1)", text: "#A78BFA", border: "rgba(167,139,250,0.25)" },
  "#F59E0B": { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", border: "rgba(245,158,11,0.25)" },
  "#FF4757": { bg: "rgba(255,71,87,0.1)", text: "#FF4757", border: "rgba(255,71,87,0.25)" },
  "#38BDF8": { bg: "rgba(56,189,248,0.1)", text: "#38BDF8", border: "rgba(56,189,248,0.25)" },
  "#6366F1": { bg: "rgba(99,102,241,0.1)", text: "#99,102,241", border: "rgba(99,102,241,0.25)" },
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { submitted, error: pageError } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/stories">

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8"
          style={{ color: "#00D4FF" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#F8FAFC" }}>
              First-Gen Success Stories
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: "rgba(248,250,252,0.55)" }}>
              Real students. Real obstacles. Real acceptance letters. These are the journeys of first-generation pre-med students who made it — and want you to know you can too.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ShareStoryModal />
          </div>
        </div>

        {submitted === "1" && (
          <div
            className="mb-8 text-sm rounded-xl px-4 py-3 flex items-center gap-2"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981" }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Thank you for sharing your story! It will appear here after review.
          </div>
        )}

        {pageError && (
          <div
            className="mb-8 text-sm rounded-xl px-4 py-3"
            style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", color: "#FF4757" }}
          >
            {decodeURIComponent(pageError)}
          </div>
        )}

        {/* Story cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STORIES.map((s) => {
            const badge = STATUS_BADGES[s.color] ?? STATUS_BADGES["#00D4FF"];
            return (
              <div key={s.name} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                {/* Avatar + name row */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: badge.bg, border: `2px solid ${badge.border}`, color: s.color }}
                  >
                    {s.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-base" style={{ color: "#F8FAFC" }}>{s.name}</p>
                    <p className="text-xs truncate" style={{ color: "rgba(248,250,252,0.5)" }}>{s.undergrad}</p>
                  </div>
                </div>

                {/* Med school badge */}
                <div
                  className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: badge.bg, border: `1px solid ${badge.border}`, color: s.color }}
                >
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {s.medSchool}
                </div>

                {/* Background */}
                <p className="text-xs leading-relaxed" style={{ color: "rgba(248,250,252,0.5)" }}>
                  {s.background}
                </p>

                {/* Quote */}
                <blockquote
                  className="text-sm leading-relaxed border-l-2 pl-4 italic"
                  style={{ color: "rgba(248,250,252,0.82)", borderColor: s.color }}
                >
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-10 rounded-2xl p-8 text-center"
          style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}
        >
          <h2 className="text-lg font-bold mb-2" style={{ color: "#F8FAFC" }}>Got into medical school?</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(248,250,252,0.55)" }}>
            Your story could be the one that keeps someone else going. Share it — we&apos;ll review it and add it to this page.
          </p>
          <ShareStoryModal />
        </div>
      </main>
    </AppShell>
  );
}
