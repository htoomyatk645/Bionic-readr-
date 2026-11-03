import { Fragment, useMemo } from "react";
import { fixationFor, shouldEmphasize, tokenize } from "~core/bionic/engine";
import type { BionicSettings, TypographySettings } from "~features/settings/types";

const SAMPLE =
  "Reading online suddenly feels easier. Bionic Redr bolds the visual anchors your eye fixates on, so your brain completes each word with less effort.";

interface PreviewProps {
  bionic: BionicSettings;
  typography: TypographySettings;
}

export function Preview({ bionic, typography }: PreviewProps) {
  const tokens = useMemo(() => tokenize(SAMPLE), []);
  return (
    <figure className="rounded-[12px] border border-line bg-surface shadow-card">
      <figcaption className="flex items-center justify-between px-3.5 pt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle">
        <span>Live preview</span>
        <span className={bionic.enabled ? "text-accent" : ""}>
          {bionic.enabled ? "Emphasis on" : "Emphasis off"}
        </span>
      </figcaption>
      <p
        className="px-3.5 pb-3.5 pt-2 text-[14.5px] text-fg-muted transition-[line-height,letter-spacing] duration-300"
        style={{
          lineHeight: typography.lineHeight,
          letterSpacing: `${typography.letterSpacing}em`
        }}
      >
        {tokens.map((t, i) => {
          if (t.kind === "gap" || !bionic.enabled || !shouldEmphasize(t.value)) {
            return <Fragment key={i}>{t.value}</Fragment>;
          }
          const { emphasis, rest } = fixationFor(t.value, {
            intensity: bionic.intensity,
            fixationStrength: bionic.fixationStrength,
            preserveCase: true
          });
          return (
            <Fragment key={i}>
              <b className="font-bold text-fg">{emphasis}</b>
              {rest}
            </Fragment>
          );
        })}
      </p>
    </figure>
  );
}
