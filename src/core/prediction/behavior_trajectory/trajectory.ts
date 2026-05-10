import type { BehaviorSnapshot } from "~core/behavior";

const MAX_TRAJECTORY = 24;

export interface SnapshotTrajectory {
  push(snapshot: BehaviorSnapshot): void;
  size(): number;
  recent(): readonly BehaviorSnapshot[];
  derivative(field: keyof Pick<BehaviorSnapshot, "fatigueScore" | "focusScore" | "engagementDepth" | "cognitiveLoadEstimate" | "abandonmentRisk" | "pacingStability">): number;
  trend(field: Parameters<SnapshotTrajectory["derivative"]>[0]): number;
}

export function createTrajectory(): SnapshotTrajectory {
  const buffer: BehaviorSnapshot[] = [];

  return {
    push(snapshot) {
      buffer.push(snapshot);
      while (buffer.length > MAX_TRAJECTORY) buffer.shift();
    },
    size() {
      return buffer.length;
    },
    recent() {
      return buffer;
    },
    derivative(field) {
      if (buffer.length < 2) return 0;
      const last = buffer[buffer.length - 1];
      const prev = buffer[buffer.length - 2];
      const dt = Math.max(1, last.generatedAt - prev.generatedAt);
      return (last[field] - prev[field]) / dt;
    },
    trend(field) {
      if (buffer.length < 3) return 0;
      const head = buffer[Math.max(0, buffer.length - 5)];
      const tail = buffer[buffer.length - 1];
      const dt = Math.max(1, tail.generatedAt - head.generatedAt);
      return (tail[field] - head[field]) / dt;
    }
  };
}
