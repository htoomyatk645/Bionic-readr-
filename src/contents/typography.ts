import type { TypographySettings } from "~features/settings/types";

const STYLE_ID = "bionic-redr-typography";

export function applyTypography(typo: TypographySettings, enabled: boolean): void {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.documentElement.appendChild(style);
  }

  if (!enabled) {
    style.textContent = baseStyles();
    return;
  }

  style.textContent = `
    ${baseStyles()}
    :root {
      --bionic-redr-font-scale: ${typo.fontScale};
      --bionic-redr-line-height: ${typo.lineHeight};
      --bionic-redr-letter-spacing: ${typo.letterSpacing}em;
      --bionic-redr-paragraph-spacing: ${typo.paragraphSpacing}em;
    }
    .bionic-redr-frag {
      letter-spacing: var(--bionic-redr-letter-spacing);
    }
  `;
}

function baseStyles(): string {
  return `
    .bionic-redr-frag {
      font-feature-settings: "liga" 1, "calt" 1;
    }
    .bionic-redr-em {
      font-weight: 700;
      font-style: inherit;
      color: inherit;
    }
    @media (prefers-color-scheme: dark) {
      .bionic-redr-em { font-weight: 600; }
    }
  `;
}

export function removeTypography(): void {
  document.getElementById(STYLE_ID)?.remove();
}
