import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

const CATEGORIES = [
  {
    id: "essentials",
    label: "Pre-Med Essentials",
    color: "#00D4FF",
    bgColor: "rgba(0,212,255,0.1)",
    borderColor: "rgba(0,212,255,0.25)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    resources: [
      {
        title: "AAMC Aspiring Docs",
        description: "The official AAMC starting point — explains what medical school is, application timelines, and how to prepare.",
        url: "https://students-residents.aamc.org/applying-medical-school",
      },
      {
        title: "MSAR (Medical School Admission Requirements)",
        description: "The definitive database of every accredited MD program with GPA/MCAT data, deadlines, and class composition. Subscription required but indispensable.",
        url: "https://students-residents.aamc.org/medical-school-admission-requirements/medical-school-admission-requirements",
      },
      {
        title: "AACOMAS Choose DO Explorer",
        description: "Compare every osteopathic medical school side-by-side — the DO equivalent of MSAR and completely free.",
        url: "https://choosedo.org/explore-schools/",
      },
      {
        title: "AAMC Application Roadmap",
        description: "Year-by-year guidance on what to do from freshman year through application submission. The official AAMC pre-med timeline.",
        url: "https://students-residents.aamc.org/choosing-medical-career/choosing-medical-career",
      },
    ],
  },
  {
    id: "mcat",
    label: "MCAT Prep (Free)",
    color: "#00D4FF",
    bgColor: "rgba(0,212,255,0.1)",
    borderColor: "rgba(0,212,255,0.25)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    resources: [
      {
        title: "Khan Academy MCAT",
        description: "Complete free MCAT prep covering all sections. Hundreds of hours of video content and practice questions.",
        url: "https://www.khanacademy.org/test-prep/mcat",
      },
      {
        title: "Jack Westin CARS Practice",
        description: "Daily free MCAT CARS passages with detailed explanations. One of the best free resources for critical analysis practice.",
        url: "https://jackwestin.com",
      },
      {
        title: "MileDown Anki Deck",
        description: "Community-curated Anki deck — the go-to free flashcard resource for MCAT content review.",
        url: "https://reddit.com/r/Mcat/wiki/decks",
      },
      {
        title: "AAMC Sample Test",
        description: "Free official AAMC sample test plus the most up-to-date prep materials directly from the test makers.",
        url: "https://students-residents.aamc.org/prepare-mcat-exam/prepare-mcat-exam",
      },
      {
        title: "MCAT Self Prep eCourse",
        description: "Free structured MCAT prep course built around the highest-yield content and study strategies.",
        url: "https://mcatselfprep.com",
      },
    ],
  },
  {
    id: "fee",
    label: "Fee Assistance",
    color: "#10B981",
    bgColor: "rgba(16,185,129,0.1)",
    borderColor: "rgba(16,185,129,0.25)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    resources: [
      {
        title: "AAMC Fee Assistance Program",
        description: "Reduces AMCAS application fees and provides free MCAT prep for qualifying low-income applicants. Can save over $2,000.",
        url: "https://students-residents.aamc.org/fee-assistance-program/fee-assistance-program",
      },
      {
        title: "AAMC FAP Essentials 2026",
        description: "The official 2026 guide explaining eligibility, benefits, and how to apply for AAMC fee assistance — required reading.",
        url: "https://students-residents.aamc.org/fee-assistance-program/publication/2026-fee-assistance-program-essentials",
      },
      {
        title: "MCAT Fee Waiver Info",
        description: "Official registration page with details on the MCAT fee structure and how FAP-approved applicants get reduced testing fees.",
        url: "https://students-residents.aamc.org/register-mcat-exam/register-mcat-exam",
      },
    ],
  },
  {
    id: "pipeline",
    label: "Pipeline Programs",
    color: "#A78BFA",
    bgColor: "rgba(139,92,246,0.1)",
    borderColor: "rgba(139,92,246,0.25)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    resources: [
      {
        title: "SNMA Pipeline Programs",
        description: "Student National Medical Association programs supporting underrepresented and first-generation pre-med students.",
        url: "https://snma.org/page/programspipeline",
      },
      {
        title: "SNMA HPREP",
        description: "Health Professions Recruitment & Exposure Program — exposes high school and college students from underrepresented backgrounds to health careers.",
        url: "https://snma.org/page/HPREP",
      },
      {
        title: "Health Professions Scholarship (HPSP)",
        description: "Full tuition plus stipend for medical school in exchange for military service. The single largest financial aid pathway for pre-meds.",
        url: "https://www.medicineandthemilitary.com/applying-and-what-to-expect/medical-school-programs/hpsp",
      },
      {
        title: "National Health Service Corps",
        description: "Full scholarships for medical school in exchange for service in underserved communities — a debt-free pathway into primary care.",
        url: "https://nhsc.hrsa.gov/scholarships",
      },
    ],
  },
  {
    id: "financial",
    label: "Financial Aid",
    color: "#F59E0B",
    bgColor: "rgba(245,158,11,0.1)",
    borderColor: "rgba(245,158,11,0.25)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    resources: [
      {
        title: "AAMC First Generation Resources",
        description: "AAMC's curated tips and roadmap for first-generation college students applying to medical school.",
        url: "https://students-residents.aamc.org/applying-medical-school/article/tips-first-generation-college-students",
      },
      {
        title: "National Medical Fellowships",
        description: "Scholarships, awards, and leadership programs specifically for underrepresented minority medical students.",
        url: "https://www.nmfonline.org",
      },
      {
        title: "FAFSA",
        description: "Apply for federal grants, loans, and work-study. Required for most institutional financial aid at medical schools.",
        url: "https://studentaid.gov/h/apply-for-aid/fafsa",
      },
    ],
  },
  {
    id: "firstgen",
    label: "First-Gen Specific",
    color: "#818CF8",
    bgColor: "rgba(99,102,241,0.1)",
    borderColor: "rgba(99,102,241,0.25)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    resources: [
      {
        title: "AAMC First Gen Premed Resources",
        description: "AAMC's Premed Navigator portal with first-gen specific guides, webinars, and pre-med advising tools.",
        url: "https://students-residents.aamc.org/premed-navigator/first-generation-college-students",
      },
      {
        title: "SDN Pre-Med Forum",
        description: "Student Doctor Network's pre-med discussion board — the largest community for application questions and advice.",
        url: "https://forums.studentdoctor.net/forums/pre-medical-general.6",
      },
      {
        title: "r/premed",
        description: "Active subreddit with school-specific threads, application cycle updates, and honest first-gen perspectives.",
        url: "https://reddit.com/r/premed",
      },
    ],
  },
  {
    id: "study",
    label: "Free Study Materials",
    color: "#38BDF8",
    bgColor: "rgba(56,189,248,0.1)",
    borderColor: "rgba(56,189,248,0.25)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    resources: [
      {
        title: "LibreTexts",
        description: "Free open-access textbooks across Biology, Chemistry, Physics, Biochem, and Psych — every pre-med prerequisite covered.",
        url: "https://libretexts.org",
      },
      {
        title: "OpenStax",
        description: "Peer-reviewed, free textbooks for Bio, Chem, Physics, Anatomy & Physiology — backed by Rice University.",
        url: "https://openstax.org",
      },
      {
        title: "Amboss",
        description: "Comprehensive medical reference with a free student tier — excellent for MCAT high-yield review and clinical context.",
        url: "https://www.amboss.com/us/students",
      },
    ],
  },
];

export default async function ResourcesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/resources">

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Back link */}
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

        {/* Page heading */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#F8FAFC" }}>Resource Library</h1>
          <p className="text-sm" style={{ color: "rgba(248,250,252,0.6)" }}>
            Free tools, programs, and guides for every pre-med journey
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {CATEGORIES.map((category) => (
            <section key={category.id}>
              {/* Section heading */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: category.bgColor, color: category.color, border: `1px solid ${category.borderColor}` }}
                >
                  {category.icon}
                </div>
                <h2 className="text-base font-semibold" style={{ color: "#F8FAFC" }}>{category.label}</h2>
                <div className="flex-1 h-px" style={{ backgroundColor: "rgba(248,250,252,0.08)" }} />
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.resources.map((resource) => (
                  <div
                    key={resource.title}
                    className="glass-card rounded-2xl p-5 flex flex-col gap-3"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold mb-1.5" style={{ color: "#F8FAFC" }}>
                        {resource.title}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(248,250,252,0.6)" }}>
                        {resource.description}
                      </p>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                      style={{ backgroundColor: category.bgColor, color: category.color, border: `1px solid ${category.borderColor}`, alignSelf: "flex-start" }}
                    >
                      Visit Resource
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
