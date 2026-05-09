import type { AppliedAdaptation } from "~core/behavior";

const STYLE_ID = "bionic-redr-styles";

export function applyPageStyles(active: boolean): void {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.documentElement.appendChild(style);
  }

  if (!active) {
    style.textContent = staticBaseStyles();
    return;
  }

  style.textContent = staticBaseStyles() + adaptiveStyles();
}

export function removePageStyles(): void {
  document.getElementById(STYLE_ID)?.remove();
  const root = document.documentElement;
  for (const v of [
    "--bionic-redr-line-height",
    "--bionic-redr-paragraph-spacing",
    "--bionic-redr-letter-spacing",
    "--bionic-redr-anim-scale"
  ]) {
    root.style.removeProperty(v);
  }
}

export function updateAdaptiveVariables(applied: AppliedAdaptation): void {
  const root = document.documentElement;
  root.style.setProperty("--bionic-redr-line-height", String(applied.lineHeight));
  root.style.setProperty(
    "--bionic-redr-paragraph-spacing",
    `${applied.paragraphSpacing}em`
  );
  root.style.setProperty(
    "--bionic-redr-letter-spacing",
    `${applied.letterSpacing}em`
  );
  root.style.setProperty(
    "--bionic-redr-anim-scale",
    String(applied.animationSpeedFactor)
  );
}

function staticBaseStyles(): string {
  return `
    :root {
      --bionic-redr-ease-emerge: cubic-bezier(0.16, 1, 0.3, 1);
      --bionic-redr-ease-soft:   cubic-bezier(0.22, 0.61, 0.36, 1);
      --bionic-redr-ease-recede: cubic-bezier(0.7, 0, 0.84, 0);
      --bionic-redr-dur-snap:   140ms;
      --bionic-redr-dur-soft:   280ms;
      --bionic-redr-dur-breathe: 420ms;
      --bionic-redr-anim-scale: 1;
    }
    .bionic-redr-frag { font-feature-settings: "liga" 1, "calt" 1; }
    .bionic-redr-em {
      font-weight: 700;
      font-style: inherit;
      color: inherit;
      transition: font-weight 200ms var(--bionic-redr-ease-soft);
    }
    @media (prefers-color-scheme: dark) { .bionic-redr-em { font-weight: 600; } }

    [data-bionic-redr-sentence] {
      transition-property: opacity, filter, text-decoration-color;
      transition-duration: calc(var(--bionic-redr-anim-scale) * var(--bionic-redr-dur-soft));
      transition-timing-function: var(--bionic-redr-ease-emerge);
    }

    html[data-bionic-redr-skim="headlines"]
      [data-bionic-redr-block]:not([data-block-kind="heading"]) {
      display: none !important;
    }
    html[data-bionic-redr-skim="headlines"] [data-bionic-redr-block][data-block-kind="heading"] {
      animation: bionic-redr-headline-in
        calc(var(--bionic-redr-anim-scale) * var(--bionic-redr-dur-breathe))
        var(--bionic-redr-ease-emerge) both;
    }
    @keyframes bionic-redr-headline-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: none; }
    }
    html[data-bionic-redr-skim="key"] [data-bionic-redr-sentence]:not([data-skim-keep]) {
      opacity: 0.32;
      filter: blur(0.35px);
    }
    html[data-bionic-redr-skim="key"] [data-bionic-redr-sentence][data-skim-keep] {
      opacity: 1;
      filter: none;
    }

    html[data-bionic-redr-radar="subtle"] [data-radar-important] {
      text-decoration: underline;
      text-decoration-color: rgba(107, 124, 255, 0.42);
      text-decoration-thickness: 1px;
      text-underline-offset: 4px;
    }
    html[data-bionic-redr-radar="medium"] [data-radar-important] {
      text-decoration: underline;
      text-decoration-color: rgba(107, 124, 255, 0.7);
      text-decoration-thickness: 1.5px;
      text-underline-offset: 4px;
    }
    html[data-bionic-redr-radar="pronounced"] [data-radar-important] {
      background: linear-gradient(transparent 62%, rgba(107, 124, 255, 0.16) 62%);
      border-radius: 2px;
    }
    @media (prefers-color-scheme: dark) {
      html[data-bionic-redr-radar="subtle"] [data-radar-important] {
        text-decoration-color: rgba(141, 158, 255, 0.55);
      }
      html[data-bionic-redr-radar="medium"] [data-radar-important] {
        text-decoration-color: rgba(141, 158, 255, 0.8);
      }
      html[data-bionic-redr-radar="pronounced"] [data-radar-important] {
        background: linear-gradient(transparent 62%, rgba(141, 158, 255, 0.22) 62%);
      }
    }

    [data-bionic-redr-block][data-bionic-redr-relief="soft"] {
      padding-block: 0.4em;
      transition: padding-block calc(var(--bionic-redr-anim-scale) * var(--bionic-redr-dur-breathe))
        var(--bionic-redr-ease-emerge);
    }
    [data-bionic-redr-block][data-bionic-redr-relief="soft"] [data-bionic-redr-sentence] {
      letter-spacing: calc(var(--bionic-redr-letter-spacing, 0em) + 0.005em);
    }
  `;
}

function adaptiveStyles(): string {
  return `
    [data-bionic-redr-block][data-block-kind="paragraph"],
    [data-bionic-redr-block][data-block-kind="list-item"],
    [data-bionic-redr-block][data-block-kind="quote"] {
      line-height: var(--bionic-redr-line-height, 1.6);
      letter-spacing: var(--bionic-redr-letter-spacing, 0em);
      transition: line-height
        calc(var(--bionic-redr-anim-scale) * var(--bionic-redr-dur-breathe))
        var(--bionic-redr-ease-emerge),
        letter-spacing
        calc(var(--bionic-redr-anim-scale) * var(--bionic-redr-dur-breathe))
        var(--bionic-redr-ease-emerge);
    }
    [data-bionic-redr-block][data-block-kind="paragraph"] {
      margin-block-end: calc(var(--bionic-redr-paragraph-spacing, 1em));
    }
  `;
}
