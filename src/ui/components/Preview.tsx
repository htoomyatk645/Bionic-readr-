import { Fragment, useMemo } from "react";
import { fixationFor, shouldEmphasize, tokenize } from "~core/bionic/engine";
import type { BionicSettings } from "~features/settings/types";

const SAMPLE =
  "Reading online suddenly feels easier. Bionic Redr highlights the visual anchors your eye fixates on, so your brain can complete each word with less effort.";

interface PreviewProps {
  settings: BionicSettings;
}

export function Preview({ settings }: PreviewProps) {
  const tokens = useMemo(() => tokenize(SAMPLE), []);
  return (
    <div
      className={
        "rounded-xl bg-ink-50 dark:bg-ink-800/60 px-4 py-3 text-[14px] leading-[1.55] text-ink-800 dark:text-ink-100 transition-opacity " +
        (settings.enabled ? "opacity-100" : "opacity-50")
      }
    >
      {tokens.map((t, i) => {
        if (t.kind === "gap") return <Fragment key={i}>{t.value}</Fragment>;
        if (!settings.enabled || !shouldEmphasize(t.value)) {
          return <Fragment key={i}>{t.value}</Fragment>;
        }
        const { emphasis, rest } = fixationFor(t.value, {
          intensity: settings.intensity,
          fixationStrength: settings.fixationStrength,
          preserveCase: true
        });
        return (
          <Fragment key={i}>
            <b className="font-bold text-ink-900 dark:text-ink-50">{emphasis}</b>
            {rest}
          </Fragment>
        );
      })}
    </div>
  );
}
