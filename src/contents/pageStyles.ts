import type { EffectiveSettings } from "~features/settings/types";

const STYLE_ID = "bionic-redr-styles";

export function applyPageStyles(effective: EffectiveSettings, active: boolean): void {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.documentElement.appendChild(style);
  }

  const typo = effective.typography;
  const typographyBlock = active
    ? `
    :root {
      --bionic-redr-line-height: ${typo.lineHeight};
      --bionic-redr-letter-spacing: ${typo.letterSpacing}em;
      --bionic-redr-paragraph-spacing: ${typo.paragraphSpacing}em;
    }
    [data-bionic-redr-block] {
      letter-spacing: var(--bionic-redr-letter-spacing);
    }
    [data-bionic-redr-block][data-block-kind="paragraph"],
    [data-bionic-redr-block][data-block-kind="list-item"] {
      line-height: var(--bionic-redr-line-height);
    }
    `
    : "";

  style.textContent = `
    .bionic-redr-frag { font-feature-settings: "liga" 1, "calt" 1; }
    .bionic-redr-em { font-weight: 700; font-style: inherit; color: inherit; }
    @media (prefers-color-scheme: dark) { .bionic-redr-em { font-weight: 600; } }

    [data-bionic-redr-sentence] {
      transition: opacity 280ms cubic-bezier(0.22, 0.61, 0.36, 1),
                  filter 280ms cubic-bezier(0.22, 0.61, 0.36, 1),
                  text-decoration-color 220ms ease;
    }

    html[data-bionic-redr-skim="headlines"]
      [data-bionic-redr-block]:not([data-block-kind="heading"]) {
      display: none !important;
    }
    html[data-bionic-redr-skim="headlines"] [data-bionic-redr-block][data-block-kind="heading"] {
      animation: bionic-redr-headline-in 320ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
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

    ${typographyBlock}
  `;
}

export function removePageStyles(): void {
  document.getElementById(STYLE_ID)?.remove();
}
