/**
 * Copy helpers.
 *
 * The approved copy deck (FGFC-Markets-Global-Content.md) contains bracketed
 * data tokens — [YEAR], [REGULATOR FULL NAME], [LICENSE NUMBER], … — whose
 * final values are still being collected by the content team. We deliberately
 * do NOT invent regulatory data. Instead, tok() renders each bracketed token
 * as a styled "awaiting entry" field so reviewers can spot every pending
 * value at a glance. The full replacement checklist lives in README.md.
 */

const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Escape copy and wrap [BRACKETED TOKENS] in a .tok span. */
export function tok(text) {
  return escapeHtml(text).replace(
    /\[([^\]]+)\]/g,
    (_, label) =>
      `<span class="tok" title="To be confirmed">[${label}]</span>`
  );
}
