import { MARK_PLUS, MARK_VIEWBOX } from "@/lib/logo";

/** The ClinicLog MD mark. Decorative by default; pass a label to announce it. */
export default function Logo({ size = 30, label }: { size?: number; label?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect width={MARK_VIEWBOX} height={MARK_VIEWBOX} fill="var(--mark-bg)" />
      <path d={MARK_PLUS} fill="var(--mark-fg)" />
    </svg>
  );
}
