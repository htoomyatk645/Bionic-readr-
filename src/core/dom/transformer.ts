import { fixationFor, shouldEmphasize, tokenize } from "../bionic/engine";
import type { BionicOptions } from "../bionic/types";

const FRAG_ATTR = "data-bionic-redr-frag";
const ORIGINAL_ATTR = "data-bionic-redr-original";
const EM_CLASS = "bionic-redr-em";
const FRAG_CLASS = "bionic-redr-frag";

export function transformTextNode(node: Text, options: BionicOptions): HTMLSpanElement | null {
  const text = node.nodeValue;
  if (!text) return null;
  if (!node.parentNode) return null;

  const tokens = tokenize(text);
  if (tokens.length === 0) return null;

  const wrapper = document.createElement("span");
  wrapper.setAttribute(FRAG_ATTR, "");
  wrapper.setAttribute(ORIGINAL_ATTR, text);
  wrapper.className = FRAG_CLASS;

  for (const token of tokens) {
    if (token.kind === "gap") {
      wrapper.appendChild(document.createTextNode(token.value));
      continue;
    }

    if (!shouldEmphasize(token.value)) {
      wrapper.appendChild(document.createTextNode(token.value));
      continue;
    }

    const { emphasis, rest } = fixationFor(token.value, options);
    if (!emphasis) {
      wrapper.appendChild(document.createTextNode(token.value));
      continue;
    }

    const em = document.createElement("b");
    em.className = EM_CLASS;
    em.textContent = emphasis;
    wrapper.appendChild(em);

    if (rest) {
      wrapper.appendChild(document.createTextNode(rest));
    }
  }

  node.parentNode.replaceChild(wrapper, node);
  return wrapper;
}

export function revertWrapper(wrapper: Element): void {
  const original = wrapper.getAttribute(ORIGINAL_ATTR);
  if (original === null) return;
  const text = document.createTextNode(original);
  wrapper.parentNode?.replaceChild(text, wrapper);
}

export function revertAll(root: ParentNode = document.body): number {
  const wrappers = root.querySelectorAll(`[${FRAG_ATTR}]`);
  wrappers.forEach(revertWrapper);
  return wrappers.length;
}

export const SELECTORS = {
  FRAG_ATTR,
  ORIGINAL_ATTR,
  EM_CLASS,
  FRAG_CLASS
} as const;
