import {
  LibraryBig,
  Calculator,
  Timer as TimerIcon,
  BookOpen,
  Users,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GradientSurface as LinearGradient } from '../components/GradientSurface';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParams, TabParams } from './types';
import { Loader, Onboarding } from '../screens/Welcome';
import { LibraryScreen, BookDetails, BookForm } from '../screens/Library';
import { Calculators, SavedCalculations } from '../screens/Calculators';
import { Timer, Reading, Sessions } from '../screens/Timer';
import { Dictionary, Term, Quiz } from '../screens/Dictionary';
import { Friends, GameSetup, Game } from '../screens/Friends';
import { useStore } from '../store/AppStore';
import { colors, gradient } from '../theme';
const Stack = createNativeStackNavigator<RootStackParams>();
const Tabs = createBottomTabNavigator<TabParams>();
const icons = {
  Library: LibraryBig,
  Calculators: Calculator,
  Timer: TimerIcon,
  Dictionary: BookOpen,
  Friends: Users,
};
function TabIcon({
  name,
  focused,
}: {
  name: keyof TabParams;
  focused: boolean;
}) {
  const Icon = icons[name];
  return (
    <LinearGradient
      colors={focused ? gradient : ['transparent', 'transparent']}
      style={{
        width: 36,
        height: 27,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={20} color={focused ? 'white' : '#85809E'} strokeWidth={1.7} />
    </LinearGradient>
  );
}
function Home() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: '#15112D',
          borderTopColor: '#352957',
          borderTopWidth: 1,
          height: 65 + Math.max(8, insets.bottom),
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom),
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        },
        tabBarActiveTintColor: '#EBA5F4',
        tabBarInactiveTintColor: '#8B819F',
        tabBarLabelStyle: { fontSize: 9, marginTop: 3 },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tabs.Screen name="Library" component={LibraryScreen} />
      <Tabs.Screen name="Calculators" component={Calculators} />
      <Tabs.Screen name="Timer" component={Timer} />
      <Tabs.Screen name="Dictionary" component={Dictionary} />
      <Tabs.Screen name="Friends" component={Friends} />
    </Tabs.Navigator>
  );
}
export function RootNavigator() {
  const { state, ready } = useStore();
  const [loaded, setLoaded] = useState(false);
  const finish = useCallback(() => setLoaded(true), []);
  if (!loaded || !ready) return <Loader onFinish={finish} />;
  if (!state.onboarded) return <Onboarding />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: colors.background,
            card: colors.surface,
            primary: colors.pink,
            text: colors.text,
            border: colors.border,
          },
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="BookDetails" component={BookDetails} />
          <Stack.Screen name="BookForm" component={BookForm} />
          <Stack.Screen
            name="SavedCalculations"
            component={SavedCalculations}
          />
          <Stack.Screen name="Sessions" component={Sessions} />
          <Stack.Screen
            name="Reading"
            component={Reading}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="Term" component={Term} />
          <Stack.Screen
            name="Quiz"
            component={Quiz}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="GameSetup" component={GameSetup} />
          <Stack.Screen
            name="Game"
            component={Game}
            options={{ gestureEnabled: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
