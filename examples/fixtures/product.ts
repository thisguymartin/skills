// Synthetic investigation fixture, not an application or implementation proposal.
export type SavedSearch = {
  id: string;
  ownerId: string;
  name: string;
  query: string;
  rollingDays: number;
};

export type ExportedPacket = Readonly<{
  savedSearchId: string;
  generatedAt: string;
  frozenItemIds: readonly string[];
}>;

export function reopen(search: SavedSearch, actorId: string, now: Date) {
  if (actorId !== search.ownerId) return { status: 403 as const };
  const until = now.toISOString();
  const since = new Date(now.getTime() - search.rollingDays * 86_400_000).toISOString();
  return { status: 200 as const, query: search.query, since, until };
}

export function makePacket(search: SavedSearch, actorId: string, now: Date, ids: string[]): ExportedPacket {
  if (actorId !== search.ownerId) throw new Error('Forbidden');
  return Object.freeze({ savedSearchId: search.id, generatedAt: now.toISOString(), frozenItemIds: Object.freeze([...ids]) });
}

export const screenCopy = {
  listTitle: 'Saved reports',
  reopenAction: 'Open report',
  packetAction: 'Export packet',
  dateExplanation: '',
};
