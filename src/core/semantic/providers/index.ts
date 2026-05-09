import { localHeuristicProvider } from "./local";
import type { SemanticProvider } from "./types";

const REGISTRY = new Map<string, SemanticProvider>();

export function registerProvider(provider: SemanticProvider): void {
  REGISTRY.set(provider.id, provider);
}

export function getProvider(id: string): SemanticProvider | undefined {
  return REGISTRY.get(id);
}

export function defaultProvider(): SemanticProvider {
  return localHeuristicProvider;
}

registerProvider(localHeuristicProvider);

export type { SemanticProvider, AnalysisRequest } from "./types";
