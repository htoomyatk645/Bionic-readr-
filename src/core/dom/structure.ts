import { extractSentenceSpans } from "~core/semantic/extraction/segmenter";
import type { BlockKind, ReadableBlock, Sentence } from "~core/semantic/types";
import { shouldSkipElement } from "./skip";

const BLOCK_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, dd, dt";

const BLOCK_ATTR = "data-bionic-redr-block";
const SENTENCE_ATTR = "data-bionic-redr-sentence";
const SENTENCE_ID_ATTR = "data-sentence-id";
const FRAG_ATTR = "data-bionic-redr-frag";

export interface DiscoveredBlock {
  block: ReadableBlock;
  element: HTMLElement;
}

interface TextRun {
  node: Text;
  start: number;
  end: number;
}

const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

function classifyBlock(el: HTMLElement): BlockKind {
  if (HEADING_TAGS.has(el.tagName)) return "heading";
  if (el.tagName === "P") return "paragraph";
  if (el.tagName === "LI") return "list-item";
  if (el.tagName === "BLOCKQUOTE") return "quote";
  if (el.tagName === "FIGCAPTION") return "caption";
  return "other";
}

function hasBlockAncestorWithin(el: HTMLElement, root: HTMLElement): boolean {
  let p: Element | null = el.parentElement;
  while (p && p !== root) {
    if (p.matches(BLOCK_SELECTOR)) return true;
    p = p.parentElement;
  }
  return false;
}

function isAlreadyDiscovered(el: HTMLElement): boolean {
  return el.hasAttribute(BLOCK_ATTR);
}

function collectRuns(block: HTMLElement): { runs: TextRun[]; text: string } {
  const runs: TextRun[] = [];
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      let p: Node | null = n.parentNode;
      while (p && p.nodeType === Node.ELEMENT_NODE && p !== block) {
        const el = p as Element;
        if (el.hasAttribute?.(FRAG_ATTR)) return NodeFilter.FILTER_REJECT;
        if (el.hasAttribute?.(SENTENCE_ATTR)) return NodeFilter.FILTER_REJECT;
        if (shouldSkipElement(el)) return NodeFilter.FILTER_REJECT;
        p = el.parentNode;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let cursor = 0;
  let text = "";
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n as Text;
    const value = t.nodeValue ?? "";
    runs.push({ node: t, start: cursor, end: cursor + value.length });
    text += value;
    cursor += value.length;
  }
  return { runs, text };
}

function wrapRange(runs: TextRun[], segStart: number, segEnd: number, sentenceId: string): void {
  const overlapping: { run: TextRun; localStart: number; localEnd: number }[] = [];
  for (const run of runs) {
    if (run.end <= segStart) continue;
    if (run.start >= segEnd) break;
    overlapping.push({
      run,
      localStart: Math.max(0, segStart - run.start),
      localEnd: Math.min(run.end - run.start, segEnd - run.start)
    });
  }
  for (let i = overlapping.length - 1; i >= 0; i--) {
    const { run, localStart, localEnd } = overlapping[i];
    const node = run.node;
    if (!node.parentNode) continue;
    if (localEnd < node.length) node.splitText(localEnd);
    let target: Text = node;
    if (localStart > 0) target = target.splitText(localStart);
    const span = document.createElement("span");
    span.setAttribute(SENTENCE_ATTR, "");
    span.setAttribute(SENTENCE_ID_ATTR, sentenceId);
    target.parentNode!.replaceChild(span, target);
    span.appendChild(target);
  }
}

let blockCounter = 0;

export function discoverAndWrapBlocks(root: HTMLElement): DiscoveredBlock[] {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR));
  const result: DiscoveredBlock[] = [];

  for (const element of elements) {
    if (isAlreadyDiscovered(element)) continue;
    if (shouldSkipElement(element)) continue;
    if (hasBlockAncestorWithin(element, root)) continue;

    const blockId = `b${blockCounter++}`;
    const { runs, text } = collectRuns(element);
    if (!text.trim()) continue;

    const spans = extractSentenceSpans(text);
    if (spans.length === 0) continue;

    const sentences: Sentence[] = spans.map((s, idx) => ({
      id: `${blockId}-${idx}`,
      blockId,
      text: s.text.trim(),
      index: idx
    }));

    for (let i = spans.length - 1; i >= 0; i--) {
      wrapRange(runs, spans[i].start, spans[i].end, sentences[i].id);
    }

    const kind = classifyBlock(element);
    element.setAttribute(BLOCK_ATTR, blockId);
    element.setAttribute("data-block-kind", kind);

    result.push({
      block: { id: blockId, kind, text: text.trim(), sentences },
      element
    });
  }

  return result;
}

export function unwrapSentences(root: ParentNode = document.body): void {
  const wrappers = root.querySelectorAll(`[${SENTENCE_ATTR}]`);
  wrappers.forEach((w) => {
    const parent = w.parentNode;
    if (!parent) return;
    while (w.firstChild) parent.insertBefore(w.firstChild, w);
    parent.removeChild(w);
    parent.normalize?.();
  });
  root.querySelectorAll(`[${BLOCK_ATTR}]`).forEach((b) => {
    b.removeAttribute(BLOCK_ATTR);
    b.removeAttribute("data-block-kind");
    b.removeAttribute("data-skim-keep");
  });
  root.querySelectorAll("[data-radar-important]").forEach((s) =>
    s.removeAttribute("data-radar-important")
  );
}

export const STRUCTURE_ATTRS = {
  BLOCK_ATTR,
  SENTENCE_ATTR,
  SENTENCE_ID_ATTR
} as const;
