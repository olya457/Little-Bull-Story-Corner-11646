export const daysBetween = (target: string, now = new Date()) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(target);
  if (!match) throw Error('Choose a target finish date.');
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  )
    throw Error('Enter a valid calendar date.');
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((Date.UTC(y, m - 1, d) - today) / 86400000);
  if (days < 1) throw Error('Choose a future finish date.');
  return days;
};
export function positive(value: string, label: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0)
    throw Error(`${label} must be greater than zero.`);
  return n;
}
export const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`;
export function readingTime(pages: number, speed: number, session: number) {
  const minutes = Math.ceil((pages / speed) * 60);
  return { minutes, sessions: Math.ceil(minutes / session) };
}
export function shuffle<T>(input: readonly T[]): T[] {
  const list = [...input];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
