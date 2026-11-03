import { useEffect, useState } from "react";
import { clearReadingMemory, countReadingMemory } from "~features/memory";
import { useSettings } from "~features/settings/store";
import { Group, Row } from "~ui/components/Group";
import { Switch } from "~ui/components/Switch";

export function MemoryGroup() {
  const memory = useSettings((s) => s.settings.memory);
  const patch = useSettings((s) => s.patchMemory);
  const [count, setCount] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let alive = true;
    void countReadingMemory().then((n) => alive && setCount(n));
    return () => {
      alive = false;
    };
  }, []);

  const clear = async () => {
    await clearReadingMemory();
    setCount(0);
    setConfirming(false);
  };

  return (
    <Group title="Continuity" description="Stored only on this device.">
      <Row label="Remember my place" description="Save where you stopped on each page.">
        <Switch
          label="Remember my place"
          checked={memory.enabled}
          onChange={(enabled) => void patch({ enabled })}
        />
      </Row>
      <Row label="Offer to resume" description="Show a hint when you come back to a page.">
        <Switch
          label="Offer to resume"
          checked={memory.enabled && memory.showWarmup}
          disabled={!memory.enabled}
          onChange={(showWarmup) => void patch({ showWarmup })}
        />
      </Row>
      <Row
        label="Reading history"
        description={
          count === null ? "…" : count === 0 ? "Nothing saved" : `${count} page${count === 1 ? "" : "s"} remembered`
        }
      >
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-7 rounded-[8px] px-2.5 text-[12px] font-medium text-fg-muted hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void clear()}
              className="h-7 rounded-[8px] bg-danger px-2.5 text-[12px] font-semibold text-white hover:opacity-90"
            >
              Clear
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!count}
            onClick={() => setConfirming(true)}
            className="h-7 rounded-[8px] border border-line px-2.5 text-[12px] font-medium text-fg hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear history
          </button>
        )}
      </Row>
    </Group>
  );
}
