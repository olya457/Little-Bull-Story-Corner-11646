import React from 'react';
import { Text } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider, useStore } from '../src/store/AppStore';
import { useClock } from '../src/utils/useClock';
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);
function Consumer() {
  const { state, ready } = useStore();
  return (
    <Text>
      {ready
        ? `${state.books.length}:${state.sessions.length}:${state.bestScore}`
        : 'loading'}
    </Text>
  );
}
test('a new user starts without demo books or sessions', async () => {
  await AsyncStorage.clear();
  let root: Renderer.ReactTestRenderer;
  await act(async () => {
    root = Renderer.create(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );
  });
  expect(root!.root.findByType(Text).props.children).toBe('0:0:0');
  await act(async () => root!.unmount());
});
test('saved user data hydrates before persistence', async () => {
  await AsyncStorage.setItem(
    'little-bull:v1',
    JSON.stringify({
      onboarded: true,
      books: [],
      sessions: [],
      calculations: [],
      bestScore: 800,
    }),
  );
  let root: Renderer.ReactTestRenderer;
  await act(async () => {
    root = Renderer.create(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );
  });
  expect(root!.root.findByType(Text).props.children).toBe('0:0:800');
  expect(
    JSON.parse((await AsyncStorage.getItem('little-bull:v1'))!).bestScore,
  ).toBe(800);
  await act(async () => root!.unmount());
});
function Clock({ running, reset }: { running: boolean; reset: number }) {
  const elapsed = useClock(running, reset);
  return <Text>{elapsed}</Text>;
}
test('clock pauses, resumes and starts the next turn from zero', async () => {
  jest.useFakeTimers();
  let root: Renderer.ReactTestRenderer;
  await act(async () => {
    root = Renderer.create(<Clock running reset={0} />);
  });
  await act(async () => {
    jest.advanceTimersByTime(3000);
  });
  expect(root!.root.findByType(Text).props.children).toBe(3);
  await act(async () => root!.update(<Clock running={false} reset={0} />));
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(root!.root.findByType(Text).props.children).toBe(3);
  await act(async () => root!.update(<Clock running reset={0} />));
  await act(async () => {
    jest.advanceTimersByTime(2000);
  });
  expect(root!.root.findByType(Text).props.children).toBe(5);
  await act(async () => root!.update(<Clock running reset={1} />));
  expect(root!.root.findByType(Text).props.children).toBe(0);
  await act(async () => root!.unmount());
  jest.useRealTimers();
});
