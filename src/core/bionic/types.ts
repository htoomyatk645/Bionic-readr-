export type Intensity = "low" | "medium" | "high" | "max";

export interface BionicOptions {
  intensity: Intensity;
  fixationStrength: number;
  preserveCase: boolean;
}

export interface FixationSplit {
  emphasis: string;
  rest: string;
}
