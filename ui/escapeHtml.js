// Minimal HTML escaping utility for any text that is injected through template strings.
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Dynamic UI strings are escaped before injection so status and move text stay text-only.
export function escapeHtml(value) {
  return `${value ?? ''}`.replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);
}
