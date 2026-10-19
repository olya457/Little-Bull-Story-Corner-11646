import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
export type RootStackParams = {
  Home: undefined;
  BookDetails: { id: string };
  BookForm: { id?: string } | undefined;
  SavedCalculations: undefined;
  Sessions: undefined;
  Reading: {
    title: string;
    bookId?: string;
    bull: number;
    scene: number;
    sound: string;
    goal: number;
  };
  Term: { id: string };
  Quiz: { tasks: number; seconds: number };
  GameSetup: undefined;
  Game: { names: string[]; rounds: number; seconds: number };
};
export type Props<T extends keyof RootStackParams> = NativeStackScreenProps<
  RootStackParams,
  T
>;

export type TabParams = {
  Library: undefined;
  Calculators: undefined;
  Timer: undefined;
  Dictionary: undefined;
  Friends: undefined;
};
export type TabProps<T extends keyof TabParams> = CompositeScreenProps<
  BottomTabScreenProps<TabParams, T>,
  NativeStackScreenProps<RootStackParams>
>;
