import type { SignalEvent } from "../types";

type Listener = (event: SignalEvent) => void;

export interface SignalBus {
  emit(event: SignalEvent): void;
  subscribe(listener: Listener): () => void;
}

export function createSignalBus(): SignalBus {
  const listeners = new Set<Listener>();
  return {
    emit(event) {
      for (const listener of listeners) listener(event);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
