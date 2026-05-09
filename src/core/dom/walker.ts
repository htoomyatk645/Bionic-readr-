import { shouldSkipElement } from "./skip";

const MIN_TEXT_LENGTH = 2;

export function collectTextNodes(root: Node): Text[] {
  const result: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue;
      if (!text || text.trim().length < MIN_TEXT_LENGTH) return NodeFilter.FILTER_REJECT;

      let parent: Node | null = node.parentNode;
      while (parent && parent.nodeType === Node.ELEMENT_NODE) {
        const el = parent as Element;
        if (el.hasAttribute?.("data-bionic-redr-frag")) return NodeFilter.FILTER_REJECT;
        if (shouldSkipElement(el)) return NodeFilter.FILTER_REJECT;
        parent = el.parentNode;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let current = walker.nextNode();
  while (current) {
    result.push(current as Text);
    current = walker.nextNode();
  }
  return result;
}
