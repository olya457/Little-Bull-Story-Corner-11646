import {
  daysBetween,
  positive,
  readingTime,
  shuffle,
  duration,
} from '../src/utils/calculations';
import quizzes from '../src/data/quizzes.json';
import terms from '../src/data/terms.json';
import { words } from '../src/data/words';
test('date calculations handle month boundaries and leap days', () => {
  expect(daysBetween('2028-03-01', new Date(2028, 1, 28))).toBe(2);
  expect(daysBetween('2026-11-01', new Date(2026, 9, 31))).toBe(1);
  expect(() => daysBetween('2026-02-29')).toThrow();
  expect(() => daysBetween('2026-10-19', new Date(2026, 9, 19))).toThrow();
});
test('reading time rounds sessions up to include the last page', () => {
  expect(readingTime(298, 40, 45)).toEqual({ minutes: 447, sessions: 10 });
  expect(() => positive('0', 'Speed')).toThrow();
  expect(() => positive('abc', 'Speed')).toThrow();
  expect(duration(3612)).toBe('60:12');
});
test('all imported quiz tasks have four unique matches and one decoy', () => {
  expect(quizzes).toHaveLength(35);
  for (const q of quizzes) {
    expect(q.statements).toHaveLength(4);
    expect(q.options).toHaveLength(5);
    expect(new Set(q.answers).size).toBe(4);
    q.answers.forEach(a => expect(q.options).toContain(a));
  }
});
test('content is complete and shuffling never drops or duplicates a word', () => {
  expect(terms).toHaveLength(120);
  expect(new Set(words).size).toBe(words.length);
  expect([...shuffle(words)].sort()).toEqual([...words].sort());
});
