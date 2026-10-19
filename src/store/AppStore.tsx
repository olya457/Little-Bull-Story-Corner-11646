import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export type Collection =
  | 'Currently Reading'
  | 'Read'
  | 'Want to Read'
  | 'Abandoned';
export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: number;
  current: number;
  rating: number;
  collection: Collection;
  description: string;
  notes: string;
  cover?: string;
  color: string;
  createdAt: string;
  finishedAt?: string;
};
export type Session = {
  id: string;
  title: string;
  bookId?: string;
  duration: number;
  pages: number;
  notes: { at: number; text: string }[];
  createdAt: string;
};
export type Calculation = {
  id: string;
  kind: string;
  value: string;
  detail: string;
  createdAt: string;
};
type State = {
  onboarded: boolean;
  books: Book[];
  sessions: Session[];
  calculations: Calculation[];
  bestScore: number;
};
const initial: State = {
  onboarded: false,
  books: [],
  sessions: [],
  calculations: [],
  bestScore: 0,
};
const key = 'little-bull:v1';
type Store = {
  state: State;
  ready: boolean;
  update: (fn: (s: State) => State) => void;
};
const Context = createContext<Store | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  const writable = useRef(true);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then(raw => {
        if (raw) {
          const value = JSON.parse(raw);
          if (
            !Array.isArray(value.books) ||
            !Array.isArray(value.sessions) ||
            !Array.isArray(value.calculations)
          )
            throw Error('Invalid data');
          setState({ ...initial, ...value });
        }
      })
      .catch(() => {
        writable.current = false;
        Alert.alert(
          'Storage unavailable',
          'Your saved data could not be opened. Restart the app to retry. Existing data has not been overwritten.',
        );
      })
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready && writable.current) {
      queue.current = queue.current
        .then(() => AsyncStorage.setItem(key, JSON.stringify(state)))
        .catch(() => {
          Alert.alert(
            'Could not save',
            'Your changes are available now, but could not be saved to this device. Please check available storage.',
          );
        });
    }
  }, [ready, state]);
  return (
    <Context.Provider value={{ state, ready, update: setState }}>
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw Error('Missing AppProvider');
  return value;
}
export const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export const collections: Collection[] = [
  'Currently Reading',
  'Read',
  'Want to Read',
  'Abandoned',
];
