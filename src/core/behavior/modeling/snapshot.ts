import type { BehaviorSnapshot, EngagementState, SignalEvent } from "../types";
import { clamp01, ewma, RollingWindow } from "./window";

const VELOCITY_WINDOW_MS = 12_000;
const EVENT_WINDOW_MS = 60_000;

interface InternalState {
  velocity: RollingWindow;
  longDwells: number;
  briefDwells: number;
  revisits: number;
  flips: number;
  idleHits: number;
  tabFlips: number;
  awayMsTotal: number;
  smoothed: {
    focus: number;
    fatigue: number;
    engagement: number;
    pacing: number;
    abandonment: number;
    load: number;
  };
  lastSignalAt: number;
  decayResetAt: number;
}

export class BehaviorModel {
  private state: InternalState = {
    velocity: new RollingWindow(VELOCITY_WINDOW_MS),
    longDwells: 0,
    briefDwells: 0,
    revisits: 0,
    flips: 0,
    idleHits: 0,
    tabFlips: 0,
    awayMsTotal: 0,
    smoothed: { focus: 0.6, fatigue: 0.2, engagement: 0.4, pacing: 0.7, abandonment: 0.2, load: 0.3 },
    lastSignalAt: Date.now(),
    decayResetAt: Date.now()
  };

  ingest(event: SignalEvent): void {
    this.state.lastSignalAt = event.at;
    this.decayCounters();

    switch (event.kind) {
      case "scroll":
        this.state.velocity.push(event.velocity, event.at);
        break;
      case "scroll-direction-flip":
        this.state.flips += 1;
        break;
      case "dwell-exit":
        if (event.durationMs >= 5000) this.state.longDwells += 1;
        else if (event.durationMs < 1500) this.state.briefDwells += 1;
        break;
      case "block-revisit":
        if (event.visit >= 2) this.state.revisits += 1;
        break;
      case "user-idle":
        this.state.idleHits += 1;
        break;
      case "tab-hidden":
        this.state.tabFlips += 1;
        break;
      case "tab-visible":
        this.state.awayMsTotal += event.awayMs;
        break;
      case "dwell-enter":
      case "user-active":
        break;
    }
  }

  private decayCounters(): void {
    const now = Date.now();
    const elapsed = now - this.state.decayResetAt;
    if (elapsed < EVENT_WINDOW_MS) return;
    const decay = 0.5;
    this.state.longDwells *= decay;
    this.state.briefDwells *= decay;
    this.state.revisits *= decay;
    this.state.flips *= decay;
    this.state.idleHits *= decay;
    this.state.tabFlips *= decay;
    this.state.awayMsTotal *= decay;
    this.state.decayResetAt = now;
  }

  snapshot(now: number = Date.now()): BehaviorSnapshot {
    this.decayCounters();
    this.state.velocity.prune(now);

    const velocityMean = this.state.velocity.mean();
    const velocityVariance = this.state.velocity.variance();
    const flips = this.state.flips;
    const revisits = this.state.revisits;
    const longDwells = this.state.longDwells;
    const briefDwells = this.state.briefDwells;
    const idleHits = this.state.idleHits;
    const tabFlips = this.state.tabFlips;
    const awayRatio = clamp01(this.state.awayMsTotal / EVENT_WINDOW_MS);

    const stability = clamp01(1 - Math.tanh(velocityVariance / 4) - flips * 0.05);
    const focusRaw = clamp01(stability - awayRatio * 0.5 - tabFlips * 0.04);
    const fatigueRaw = clamp01(
      revisits * 0.15 +
        Math.max(0, longDwells - 2) * 0.06 +
        idleHits * 0.08 +
        awayRatio * 0.4 -
        Math.max(0, focusRaw - 0.6) * 0.3
    );
    const engagementRaw = clamp01(
      longDwells * 0.12 - briefDwells * 0.08 + (1 - awayRatio) * 0.3
    );
    const abandonmentRaw = clamp01(
      briefDwells * 0.12 + tabFlips * 0.08 + Math.max(0, velocityMean) * 0.04
    );
    const loadRaw = clamp01(fatigueRaw * 0.6 + revisits * 0.06 + idleHits * 0.05);

    const s = this.state.smoothed;
    s.focus = ewma(s.focus, focusRaw, 0.18);
    s.fatigue = ewma(s.fatigue, fatigueRaw, 0.16);
    s.engagement = ewma(s.engagement, engagementRaw, 0.18);
    s.pacing = ewma(s.pacing, stability, 0.2);
    s.abandonment = ewma(s.abandonment, abandonmentRaw, 0.18);
    s.load = ewma(s.load, loadRaw, 0.16);

    return {
      focusScore: s.focus,
      fatigueScore: s.fatigue,
      engagementDepth: s.engagement,
      pacingStability: s.pacing,
      abandonmentRisk: s.abandonment,
      cognitiveLoadEstimate: s.load,
      state: deriveState(s, velocityMean),
      generatedAt: now
    };
  }

  reset(): void {
    this.state = new BehaviorModel().state;
  }
}

function deriveState(
  s: InternalState["smoothed"],
  velocityMean: number
): EngagementState {
  if (s.fatigue > 0.62) return "fatigued";
  if (s.engagement < 0.32 && s.abandonment > 0.45) return "drifting";
  if (Math.abs(velocityMean) > 0.45 && s.engagement < 0.5) return "scanning";
  if (s.engagement > 0.62 && s.focus > 0.55) return "studying";
  return "focused";
}
