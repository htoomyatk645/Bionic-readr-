import type { FrictionMap } from "../types";

const RELIEF_ATTR = "data-bionic-redr-relief";

export interface ReliefTarget {
  blockId: string;
  element: HTMLElement;
}

export function applyRelief(targets: ReliefTarget[], map: FrictionMap): void {
  const high = map.highRelief;
  for (const t of targets) {
    const shouldRelieve = high.has(t.blockId);
    const has = t.element.hasAttribute(RELIEF_ATTR);
    if (shouldRelieve && !has) t.element.setAttribute(RELIEF_ATTR, "soft");
    else if (!shouldRelieve && has) t.element.removeAttribute(RELIEF_ATTR);
  }
}

export function clearRelief(): void {
  document
    .querySelectorAll(`[${RELIEF_ATTR}]`)
    .forEach((el) => el.removeAttribute(RELIEF_ATTR));
}
