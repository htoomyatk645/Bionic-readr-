export interface SessionAggregate {
  startedAt: number;
  lastActiveAt: number;
  totalActiveMs: number;
}

export function createSession(): SessionAggregate {
  const now = Date.now();
  return { startedAt: now, lastActiveAt: now, totalActiveMs: 0 };
}

export function tickSession(session: SessionAggregate, isActive: boolean): SessionAggregate {
  const now = Date.now();
  if (isActive) {
    return {
      ...session,
      totalActiveMs: session.totalActiveMs + (now - session.lastActiveAt),
      lastActiveAt: now
    };
  }
  return { ...session, lastActiveAt: now };
}

export function sessionDuration(session: SessionAggregate): number {
  return session.totalActiveMs;
}
