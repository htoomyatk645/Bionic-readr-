import { Fragment, useMemo } from "react";
import { fixationFor, shouldEmphasize, tokenize } from "~core/bionic/engine";
import type { BionicSettings, TypographySettings } from "~features/settings/types";

const SAMPLE =
  "Your eyes don't read every letter. They jump between anchor points, and your brain fills in the rest. Bold anchors make each jump land sooner.";

interface PreviewProps {
  bionic: BionicSettings;
  typography: TypographySettings;
  dimmed?: boolean;
}

/** The text the reader is actually tuning — rendered with the live settings. */
export function Preview({ bionic, typography, dimmed }: PreviewProps) {
  const tokens = useMemo(() => tokenize(SAMPLE), []);
  return (
    <p
      aria-label="Preview of your reading settings"
      className={
        "br-sample text-[17px] text-fg-muted transition-[line-height,letter-spacing,opacity] duration-300 " +
        (dimmed ? "opacity-50" : "")
      }
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
  );
}
