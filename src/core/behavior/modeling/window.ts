export class RollingWindow {
  private readonly samples: { value: number; at: number }[] = [];

  constructor(private readonly windowMs: number, private readonly maxSamples = 200) {}

  push(value: number, at: number = Date.now()): void {
    this.samples.push({ value, at });
    this.prune(at);
  }

  prune(now: number = Date.now()): void {
    const cutoff = now - this.windowMs;
    while (this.samples.length > 0 && this.samples[0].at < cutoff) this.samples.shift();
    while (this.samples.length > this.maxSamples) this.samples.shift();
  }

  count(predicate?: (value: number) => boolean): number {
    if (!predicate) return this.samples.length;
    let n = 0;
    for (const s of this.samples) if (predicate(s.value)) n += 1;
    return n;
  }

  mean(): number {
    if (this.samples.length === 0) return 0;
    let sum = 0;
    for (const s of this.samples) sum += s.value;
    return sum / this.samples.length;
  }

  variance(): number {
    if (this.samples.length < 2) return 0;
    const m = this.mean();
    let sum = 0;
    for (const s of this.samples) sum += (s.value - m) * (s.value - m);
    return sum / (this.samples.length - 1);
  }

  size(): number {
    return this.samples.length;
  }

  clear(): void {
    this.samples.length = 0;
  }
}

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function ewma(prev: number, sample: number, alpha: number): number {
  return prev + alpha * (sample - prev);
}
