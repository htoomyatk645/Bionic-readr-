const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "CANVAS",
  "SVG",
  "MATH",
  "VIDEO",
  "AUDIO",
  "CODE",
  "PRE",
  "KBD",
  "SAMP",
  "VAR",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION",
  "BUTTON",
  "TEMPLATE",
  "HEAD",
  "TITLE",
  "META",
  "LINK"
]);

export function shouldSkipElement(el: Element): boolean {
  if (SKIP_TAGS.has(el.tagName)) return true;
  if ((el as HTMLElement).isContentEditable) return true;

  const role = el.getAttribute("role");
  if (role && /^(textbox|combobox|listbox|grid|toolbar|menu|menubar)$/.test(role)) return true;

  const aria = el.getAttribute("aria-hidden");
  if (aria === "true") return true;

  if (el.classList.contains("bionic-redr-skip")) return true;
  if (el.closest("[data-bionic-redr-managed]") && !el.hasAttribute("data-bionic-redr-managed"))
    return false;

  return false;
}

export function isVisible(el: Element): boolean {
  const rect = (el as HTMLElement).getBoundingClientRect?.();
  if (!rect) return true;
  if (rect.width === 0 && rect.height === 0) return false;
  const style = window.getComputedStyle(el as HTMLElement);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return true;
}
