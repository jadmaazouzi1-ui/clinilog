import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES = [
  {
    id: "mcat",
    label: "MCAT Prep",
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
        description: "Complete free MCAT prep covering all sections. Hundreds of hours of video content and practice.",
        url: "https://www.khanacademy.org/test-prep/mcat",
      },
      {
        title: "AAMC Official MCAT Prep",
        description: "The official source for MCAT prep including free practice questions and study guides from the test makers.",
        url: "https://students-residents.aamc.org/prepare-mcat-exam",
      },
      {
        title: "Jack Westin Free CARS",
        description: "Daily free MCAT CARS passages with explanations. One of the best free resources for critical analysis practice.",
        url: "https://jackwestin.com",
      },
    ],
  },
  {
    id: "fee",
    label: "Fee Assistance Programs",
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
        description: "Reduces AMCAS application fees and provides free MCAT prep resources for qualifying low-income applicants. Can save over $2,000.",
        url: "https://students-residents.aamc.org/applying-medical-school/applying-medical-school-process/fee-assistance-program",
      },
      {
        title: "AACOMAS Fee Assistance",
        description: "Fee assistance for DO medical school applicants through the osteopathic application service.",
        url: "https://help.liaisonedu.com/AACOMAS_Applicant_Help_Center",
      },
      {
        title: "TMDSAS (Texas Schools)",
        description: "Centralized application for Texas public medical schools with lower fees than AMCAS. Texas residents get significant savings.",
        url: "https://www.tmdsas.com",
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
        title: "SNMA Pre-Med Programs",
        description: "Student National Medical Association programs specifically supporting underrepresented and first-generation pre-med students.",
        url: "https://snma.org",
      },
      {
        title: "LMSA Mentorship Network",
        description: "Latino Medical Student Association connects pre-med students with medical student mentors nationwide.",
        url: "https://lmsa.net",
      },
      {
        title: "AAMC SHPEP",
        description: "Summer Health Professions Education Program — free 6-week residential program at top medical schools for underrepresented students.",
        url: "https://www.shpep.org",
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
        title: "Federal Student Aid (FAFSA)",
        description: "Apply for federal grants, loans, and work-study programs. Required for most institutional financial aid at medical schools.",
        url: "https://studentaid.gov",
      },
      {
        title: "NHSC Scholarship Program",
        description: "National Health Service Corps offers full scholarships for medical school in exchange for service in underserved communities.",
        url: "https://nhsc.hrsa.gov/scholarships",
      },
      {
        title: "Hispanic Scholarship Fund",
        description: "Scholarships for Hispanic-American students pursuing higher education including pre-med and medical school.",
        url: "https://www.hsf.net",
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
        title: "AAMC First Generation Hub",
        description: "Curated resources, webinars, and guidance specifically for first-generation college students pursuing medicine.",
        url: "https://students-residents.aamc.org/preparing-for-medical-school/first-generation-college-students",
      },
      {
        title: "MedEdits Free Guides",
        description: "Free medical school admissions guides covering personal statements, secondaries, and interviews.",
        url: "https://www.mededits.com/free-resources",
      },
      {
        title: "Doctors Without Borders Volunteering",
        description: "Global health volunteering opportunities and resources for students interested in global medicine.",
        url: "https://www.doctorswithoutborders.org/get-involved/volunteer",
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
        title: "Anki Flashcards",
        description: "Free spaced-repetition flashcard software. The pre-med Anki community has thousands of free pre-made decks for MCAT and pre-med courses.",
        url: "https://apps.ankiweb.net",
      },
      {
        title: "OpenStax Free Textbooks",
        description: "Free peer-reviewed textbooks for Biology, Chemistry, Physics, Anatomy & Physiology — all required pre-med subjects.",
        url: "https://openstax.org",
      },
      {
        title: "Osmosis Free Tier",
        description: "Medical education videos and content with a free tier. Great visual explanations for anatomy, physiology, and pathology.",
        url: "https://www.osmosis.org",
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
    <div className="min-h-screen dot-grid-bg" style={{ backgroundColor: "#0A1628" }}>
      {/* Top nav */}
      <header
        className="px-6 py-4"
        style={{ backgroundColor: "rgba(10,22,40,0.95)", borderBottom: "1px solid rgba(0,212,255,0.18)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00D4FF" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 12 6 9 9 13 12 7 15 11 18 8 21 12" />
              </svg>
            </div>
            <span className="font-semibold text-lg" style={{ color: "#F8FAFC" }}>CliniLog</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block" style={{ color: "rgba(248,250,252,0.6)" }}>
              {user.email}
            </span>
            <Link href="/schools" className="text-sm font-medium" style={{ color: "rgba(248,250,252,0.7)" }}>
              Schools
            </Link>
            <Link href="/resources" className="text-sm font-medium" style={{ color: "#00D4FF" }}>
              Resources
            </Link>
            <Link href="/fee-tracker" className="text-sm font-medium" style={{ color: "rgba(248,250,252,0.7)" }}>
              Fee Tracker
            </Link>
            <Link href="/profile" className="text-sm font-medium" style={{ color: "rgba(248,250,252,0.7)" }}>
              Profile
            </Link>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "#00D4FF", border: "1px solid rgba(0,212,255,0.35)", background: "transparent" }}
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

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
            Free tools and programs for first-gen pre-med students
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
    </div>
  );
}
