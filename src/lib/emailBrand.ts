// Shared HTML shell for ClinicLog MD emails: the mark and name on paper, a
// white card with a hairline edge, a serif heading, and a gold button with
// black text. The same structure as docs/supabase-email-templates. Email
// clients ignore CSS variables and most <style> rules, so everything is
// inline and the colours come from the palette that mirrors theme.css.
// Plain-text versions are built separately by each sender and are unchanged.

import { PALETTE as P } from "./palette";

const SITE = "https://www.cliniclogmd.com";
const FONT = "system-ui,-apple-system,Segoe UI,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

export const EMAIL = {
  text: P.ink,
  muted: P.stone700,
  hairline: P.stone200,
  link: P.gold700,
};

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function para(html: string, style = ""): string {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${EMAIL.text};${style}">${html}</p>`;
}

export function button(href: string, label: string): string {
  return `<a href="${esc(href)}" class="cl-btn" style="display:inline-block;background:${P.gold500};color:${P.black};text-decoration:none;padding:12px 20px;font-size:15px;font-weight:600;border-radius:4px">${esc(label)}</a>`;
}

/**
 * The full document. `footer` is trusted HTML built by the caller (it holds
 * the unsubscribe links); everything user-derived must be escaped first.
 */
export function emailShell({ eyebrow, title, body, footer }: { eyebrow: string; title: string; body: string; footer: string }): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<style>@media (prefers-color-scheme: dark){.cl-page{background:${P.black}!important}.cl-name{color:${P.cream}!important}.cl-card{background:${P.ink}!important;border-color:${P.night400}!important}.cl-card p,.cl-card h1,.cl-card td{color:${P.cream}!important}.cl-eyebrow,.cl-card .cl-muted{color:${P.creamMuted}!important}.cl-foot,.cl-foot a{color:${P.creamMuted}!important}}</style></head>
<body class="cl-page" style="margin:0;background:${P.paper};font-family:${FONT};color:${EMAIL.text}">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p class="cl-name" style="margin:0 0 16px;font-size:15px;font-weight:600;color:${EMAIL.text}"><img src="${SITE}/icon-192.png" width="20" height="20" alt="" style="display:inline-block;vertical-align:-4px;border:0;margin-right:8px">ClinicLog MD</p>
<div class="cl-card" style="background:${P.white};border:1px solid ${EMAIL.hairline};border-radius:6px;padding:24px">
<p class="cl-eyebrow" style="margin:0 0 4px;font-size:13px;color:${EMAIL.muted}">${esc(eyebrow)}</p>
<h1 style="margin:0 0 16px;font-family:${SERIF};font-size:21px;font-weight:600;line-height:1.3;color:${EMAIL.text}">${esc(title)}</h1>
${body}
</div>
<p class="cl-foot" style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${EMAIL.muted}">${footer}<br>ClinicLog MD, cliniclogmd.com</p>
</div></body></html>`;
}

/** A small standalone page (the unsubscribe confirmation) in the same style. */
export function brandPage(body: string): string {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>ClinicLog MD</title></head><body style="margin:0;background:${P.paper};color:${EMAIL.text};font-family:${FONT}"><div style="max-width:440px;margin:64px auto"><p style="margin:0 0 16px;font-size:15px;font-weight:600"><img src="${SITE}/icon-192.png" width="20" height="20" alt="" style="display:inline-block;vertical-align:-4px;border:0;margin-right:8px">ClinicLog MD</p><div style="padding:24px;background:${P.white};border:1px solid ${EMAIL.hairline};border-radius:6px">${body}</div></div></body></html>`;
}

export const EMAIL_STYLE = { muted: `color:${EMAIL.muted}`, link: `color:${EMAIL.link};text-decoration:underline` };
export const PAGE_BUTTON = `background:${P.gold500};color:${P.black};border:0;border-radius:4px;padding:10px 18px;font-weight:700;cursor:pointer;min-height:44px`;
