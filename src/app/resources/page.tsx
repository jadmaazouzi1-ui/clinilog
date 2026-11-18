import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

const CATEGORIES = [
  {
    id: "essentials",
    label: "Pre-med essentials",
    resources: [
      {
        title: "AAMC Aspiring Docs",
        description: "The official AAMC starting point: explains what medical school is, application timelines, and how to prepare.",
        url: "https://students-residents.aamc.org/applying-medical-school",
      },
      {
        title: "Choose DO Explorer (AACOM)",
        description: "Filter osteopathic medical schools by location, tuition and deadlines. Free, and the closest DO equivalent of MSAR.",
        url: "https://www.aacom.org/become-a-doctor",
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
    label: "Free MCAT prep",
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
        description: "Community-curated Anki deck: the go-to free flashcard resource for MCAT content review.",
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
    label: "Fee assistance",
    resources: [
      {
        title: "AAMC Fee Assistance Program",
        description: "Reduces AMCAS application fees and provides free MCAT prep for qualifying low-income applicants. Can save over $2,000.",
        url: "https://students-residents.aamc.org/fee-assistance-program/fee-assistance-program",
      },
      {
        title: "AAMC FAP Essentials 2026",
        description: "The official 2026 guide explaining eligibility, benefits, and how to apply for AAMC fee assistance: required reading.",
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
    label: "Pipeline programs",
    resources: [
      {
        title: "SNMA Pipeline Programs",
        description: "Student National Medical Association programs supporting underrepresented and first-generation pre-med students.",
        url: "https://snma.org/page/programspipeline",
      },
      {
        title: "SNMA HPREP",
        description: "Health Professions Recruitment & Exposure Program: exposes high school and college students from underrepresented backgrounds to health careers.",
        url: "https://snma.org/page/HPREP",
      },
      {
        title: "Health Professions Scholarship (HPSP)",
        description: "Full tuition plus stipend for medical school in exchange for military service. The single largest financial aid pathway for pre-meds.",
        url: "https://www.medicineandthemilitary.com/applying-and-what-to-expect/medical-school-programs/hpsp",
      },
      {
        title: "National Health Service Corps",
        description: "Full scholarships for medical school in exchange for service in underserved communities: a debt-free pathway into primary care.",
        url: "https://nhsc.hrsa.gov/scholarships",
      },
    ],
  },
  {
    id: "financial",
    label: "Financial aid",
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
    label: "For first-generation students",
    resources: [
      {
        title: "AAMC First Gen Premed Resources",
        description: "AAMC's Premed Navigator portal with first-gen specific guides, webinars, and pre-med advising tools.",
        url: "https://students-residents.aamc.org/premed-navigator/first-generation-college-students",
      },
      {
        title: "SDN Pre-Med Forum",
        description: "Student Doctor Network's pre-med discussion board: the largest community for application questions and advice.",
        url: "https://forums.studentdoctor.net/forums/pre-medical-md.10/",
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
    label: "Free study materials",
    resources: [
      {
        title: "LibreTexts",
        description: "Free open-access textbooks across Biology, Chemistry, Physics, Biochem, and Psych: every pre-med prerequisite covered.",
        url: "https://libretexts.org",
      },
      {
        title: "OpenStax",
        description: "Peer-reviewed, free textbooks for Bio, Chem, Physics, Anatomy & Physiology: backed by Rice University.",
        url: "https://openstax.org",
      },
      {
        title: "Amboss",
        description: "Comprehensive medical reference with a free student tier: excellent for MCAT high-yield review and clinical context.",
        url: "https://www.amboss.com/us/students",
      },
    ],
  },
];

export const metadata = {
  description: "Free MCAT prep, fee assistance, scholarships and pipeline programs for pre-meds.",
};

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

      <main className="page">
        <Link href="/dashboard" className="link text-sm">Back to Overview</Link>
        <header style={{ margin: "var(--sp-15) 0 var(--sp-5)" }}>
          <h1 className="text-2xl">Resources</h1>
          <p className="text-sm measure" style={{ color: "var(--text-muted)", marginTop: "var(--sp-h)" }}>
            MCAT prep, fee assistance, scholarships and pipeline programs, most of them free. Every link goes to the
            organization&apos;s own site. Last checked Oct 28, 2026.
          </p>
        </header>

        {CATEGORIES.map((category) => (
          <section key={category.id} className="grid lg:grid-cols-12" style={{ gap: "var(--sp-15) var(--sp-4)", padding: "var(--sp-3) 0", borderTop: "1px solid var(--border-strong)" }}>
            <h2 className="section-title lg:col-span-3">{category.label}</h2>
            <ul className="lg:col-span-9">
              {category.resources.map((resource, i) => (
                <li key={resource.title} style={{ padding: "var(--sp-15) 0", borderTop: i ? "1px solid var(--border)" : undefined }}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="link font-semibold">
                    {resource.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <span className="meta" style={{ marginLeft: "var(--sp-1)" }}>{new URL(resource.url).hostname.replace(/^www\./, "")}</span>
                  <p className="text-sm measure" style={{ color: "var(--text-muted)", marginTop: 2 }}>{resource.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </AppShell>
  );
}
