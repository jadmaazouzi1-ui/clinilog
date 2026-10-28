// Clean-up applied to every AI response before it reaches the user. The
// prompts already ask for this; models do not always comply.

const OPENERS = /^(certainly|sure|absolutely|of course|great question|good question|happy to help|i'd be happy to help|i would be happy to help|what a great question)\b[!.,:]*\s*/i;
const RECAP = /^(in summary|in conclusion|to summarize|to sum up|overall|all in all|ultimately)\b/i;

export function cleanAiText(input: string): string {
  let s = input.trim();

  // Leading filler, possibly stacked ("Sure! Great question.").
  for (let i = 0; i < 3 && OPENERS.test(s); i++) s = s.replace(OPENERS, "");

  // Numeric ranges keep a plain hyphen; a dash used as a pause becomes a comma.
  s = s.replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, "$1-$2");
  s = s.replace(/\s*[\u2014\u2013]\s*/g, ", ");
  s = s.replace(/\s+--\s+/g, ", ");

  // A closing paragraph that only restates what came before.
  const paras = s.split(/\n{2,}/);
  if (paras.length > 1 && RECAP.test(paras[paras.length - 1].trim())) paras.pop();
  s = paras.join("\n\n");

  return s
    .replace(/,\s*,/g, ",")
    .replace(/,\s*([.!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^\s*([a-z])/, (m) => m.toUpperCase())
    .trim();
}

/** Applies cleanAiText to every string inside a parsed JSON result. */
export function cleanAiDeep<T>(value: T): T {
  if (typeof value === "string") return cleanAiText(value) as T;
  if (Array.isArray(value)) return value.map(cleanAiDeep) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k.endsWith("_id") ? v : cleanAiDeep(v)])) as T;
  }
  return value;
}

/** Shared writing rules appended to every AI prompt. */
export const HUMAN_STYLE_RULES = `Writing rules:
- Plain words, short sentences, varied length. Write like a student talking to another student.
- No em dashes or en dashes. Use a comma, colon, period or parentheses.
- Never use: unlock, elevate, empower, seamless, streamline, leverage, robust, journey, delve, tapestry, passionate, "not just X but Y", "whether you're", "in today's world", "it's important to note".
- No openers like "Since I was young", "Certainly" or "Great question". No closing recap that repeats what you said.
- Use only facts from the student's data. Never invent patients, quotes, outcomes, hours, titles, awards or credentials. If a detail is missing, say what is missing instead of filling it in.`;
