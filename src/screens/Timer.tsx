import { SelectionField, minuteOptions } from '../components/SelectionField';
import { StoryArt, PageReveal } from '../components/Motion';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  Switch,
  Alert,
  AppState,
  Vibration,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientSurface as LinearGradient } from '../components/GradientSurface';
import { usePreventRemove } from '@react-navigation/native';
import { assets } from '../assets';
import { AmbientAudio } from '../components/AmbientAudio';
import {
  Button,
  Chips,
  Empty,
  Field,
  Header,
  Screen,
  Sheet,
  Stat,
} from '../components/UI';
import { Props, TabProps } from '../navigation/types';
import { styles as s, colors } from '../theme';
import { uid, useStore } from '../store/AppStore';
import { duration } from '../utils/calculations';
import { useClock } from '../utils/useClock';
const sceneNames = ['Starry Night', 'Rainy Library', 'Fireside', 'Aurora'];
export function Timer({ navigation }: TabProps<'Timer'>) {
  const { state } = useStore();
  const [title, setTitle] = useState('');
  const [bookId, setBookId] = useState<string>();
  const [bull, setBull] = useState(0);
  const [scene, setScene] = useState(0);
  const [sound, setSound] = useState('None');
  const [goalOn, setGoalOn] = useState(true);
  const [goal, setGoal] = useState(30);
  return (
    <Screen>
      <Header
        title="Reading Timer"
        subtitle="Set the mood"
        action={
          <Button
            title="Sessions"
            secondary
            onPress={() => navigation.navigate('Sessions')}
          />
        }
      />
      <ImageBackground
        source={assets.scenes[scene]}
        imageStyle={{ borderRadius: 22, opacity: 0.5 }}
        style={[s.card, { overflow: 'hidden', height: 180 }]}
      >
        <Text style={s.label}>{sceneNames[scene]}</Text>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Now reading</Text>
            <Text style={[s.title, { fontFamily: 'Georgia', fontSize: 22 }]}>
              {title || 'Your next chapter'}
            </Text>
            <Text style={s.small}>
              {goalOn ? `${goal} min goal` : 'Free reading'} · {sound}
            </Text>
          </View>
          <StoryArt
            source={assets.bulls[bull]}
            style={{ width: 110, height: 110 }}
          />
        </View>
      </ImageBackground>
      <View style={s.section}>
        <Field
          label="BOOK TITLE *"
          placeholder="What are you reading?"
          value={title}
          onChangeText={t => {
            setTitle(t);
            setBookId(undefined);
          }}
        />
        {state.books.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={s.small}>Or choose from your library</Text>
            <Chips
              options={state.books.map(b => b.title)}
              value={title}
              onChange={t => {
                const b = state.books.find(x => x.title === t);
                setTitle(t);
                setBookId(b?.id);
              }}
            />
          </View>
        )}
        <Text style={s.label}>Little Bull</Text>
        <View style={s.row}>
          {assets.bulls.map((a, i) => (
            <Pressable
              key={i}
              onPress={() => setBull(i)}
              style={{ flex: 1, alignItems: 'center', gap: 5 }}
            >
              <Image
                source={a}
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  borderWidth: bull === i ? 2 : 0,
                  borderColor: colors.pink,
                }}
              />
              <Text style={s.small}>
                {['Classic', 'Close-up', 'Night Owl', 'Sunset'][i]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.label}>Scene</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {assets.scenes.map((a, i) => (
            <Pressable
              key={i}
              onPress={() => setScene(i)}
              style={{ width: '48%', flexGrow: 1 }}
            >
              <ImageBackground
                source={a}
                style={{
                  height: 75,
                  justifyContent: 'flex-end',
                  padding: 8,
                  borderWidth: scene === i ? 2 : 0,
                  borderColor: colors.pink,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <Text
                  style={{ color: 'white', fontSize: 12, fontWeight: '600' }}
                >
                  {sceneNames[i]}
                </Text>
              </ImageBackground>
            </Pressable>
          ))}
        </View>
        <Text style={s.label}>Ambient sound</Text>
        <Chips
          options={['None', 'Rain', 'Fireplace', 'Café', 'Waves']}
          value={sound}
          onChange={setSound}
        />
        <View style={s.card}>
          <View style={s.between}>
            <View>
              <Text style={s.heading}>Reading goal</Text>
              <Text style={s.small}>Little Bull cheers when you hit it</Text>
            </View>
            <Switch
              value={goalOn}
              onValueChange={setGoalOn}
              trackColor={{ true: colors.green, false: colors.field }}
            />
          </View>
          {goalOn && (
            <SelectionField
              label="Goal duration"
              options={minuteOptions}
              value={goal}
              onChange={setGoal}
            />
          )}
        </View>
        <Button
          title="▶ Start Session"
          disabled={!title.trim()}
          onPress={() =>
            navigation.navigate('Reading', {
              title: title.trim(),
              bookId,
              bull,
              scene,
              sound,
              goal: goalOn ? goal : 0,
            })
          }
        />
      </View>
    </Screen>
  );
}
export function Reading({ navigation, route }: Props<'Reading'>) {
  const { update } = useStore();
  const config = route.params;
  const { height, width, fontScale } = useWindowDimensions();
  const compact = height < 730 || width < 375 || fontScale > 1.15;
  const [running, setRunning] = useState(true);
  const elapsed = useClock(running);
  const [notesOpen, setNotesOpen] = useState(false);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<{ at: number; text: string }[]>([]);
  const [finish, setFinish] = useState(false);
  const [pages, setPages] = useState('0');
  const [leaving, setLeaving] = useState(false);
  const goalHit = useRef(false);
  const saved = useRef(false);
  useEffect(() => {
    if (config.goal && elapsed >= config.goal * 60 && !goalHit.current) {
      goalHit.current = true;
      Vibration.vibrate();
      Alert.alert(
        'Reading goal reached!',
        'Wonderful work. Keep reading, or finish and save your session.',
      );
    }
  }, [elapsed, config.goal]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') setRunning(false);
    });
    return () => sub.remove();
  }, []);
  usePreventRemove(!leaving, ({ data }) => {
    setRunning(false);
    Alert.alert(
      'Discard this session?',
      'Your timer and quick notes from this session will be lost.',
      [
        {
          text: 'Keep reading',
          style: 'cancel',
          onPress: () => setRunning(true),
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    );
  });
  useEffect(() => {
    if (leaving) navigation.goBack();
  }, [leaving, navigation]);
  const save = () => {
    const p = Number(pages);
    if (!Number.isInteger(p) || p < 0)
      return Alert.alert(
        'Invalid page count',
        'Enter a whole number of pages, zero or greater.',
      );
    if (saved.current) return;
    saved.current = true;
    update(st => ({
      ...st,
      sessions: [
        {
          id: uid(),
          title: config.title,
          bookId: config.bookId,
          duration: elapsed,
          pages: p,
          notes,
          createdAt: new Date().toISOString(),
        },
        ...st.sessions,
      ],
      books: st.books.map(b =>
        b.id === config.bookId
          ? { ...b, current: Math.min(b.pages, b.current + p) }
          : b,
      ),
    }));
    setLeaving(true);
  };
  return (
    <ImageBackground source={assets.scenes[config.scene]} style={{ flex: 1 }}>
      <LinearGradient
        colors={['#08051A50', '#08051A00', '#08051ACA']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <PageReveal
              style={{
                flexGrow: 1,
                padding: compact ? 16 : 24,
                justifyContent: 'space-between',
                gap: compact ? 20 : 28,
              }}
            >
              <View style={s.center}>
                <Text style={s.label}>Now reading</Text>
                <Text
                  style={[
                    s.heading,
                    {
                      fontFamily: 'Georgia',
                      marginTop: 8,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {config.title}
                </Text>
              </View>
              <View style={[s.center, { gap: compact ? 10 : 20 }]}>
                <StoryArt
                  source={assets.bulls[config.bull]}
                  style={{
                    width: compact ? 105 : 150,
                    height: compact ? 105 : 150,
                  }}
                />
                <View
                  style={{
                    width: compact ? 155 : 190,
                    height: compact ? 155 : 190,
                    borderRadius: 100,
                    borderWidth: 6,
                    borderColor: colors.pink,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#130C4288',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 50,
                      fontWeight: '300',
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {duration(elapsed)}
                  </Text>
                </View>
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {running ? 'Reading session in progress' : 'Reading paused'}
                </Text>
                <Text style={{ color: '#E8DFFA', fontSize: 12 }}>
                  {config.goal
                    ? `Goal: ${config.goal} min`
                    : 'No rush. Just one more page.'}{' '}
                  · {config.sound}
                </Text>
              </View>
              <View style={[s.row, { justifyContent: 'center' }]}>
                <Button
                  title={`Notes ${notes.length || ''}`}
                  secondary
                  onPress={() => setNotesOpen(true)}
                />
                <Button
                  title={running ? 'Ⅱ Pause' : '▶ Resume'}
                  onPress={() => setRunning(!running)}
                />
                <Button
                  title="Finish"
                  secondary
                  onPress={() => {
                    setRunning(false);
                    setFinish(true);
                  }}
                />
              </View>
            </PageReveal>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
      <AmbientAudio sound={config.sound} playing={running} />
      <Sheet visible={notesOpen} onClose={() => setNotesOpen(false)}>
        <View style={s.between}>
          <Text style={s.heading}>Quick Notes</Text>
          <Pressable onPress={() => setNotesOpen(false)}>
            <Text style={{ color: colors.pink }}>Done</Text>
          </Pressable>
        </View>
        <Field
          multiline
          placeholder="A thought, a quote, a question…"
          value={note}
          onChangeText={setNote}
        />
        <Button
          title={`Add note @${duration(elapsed)}`}
          disabled={!note.trim()}
          onPress={() => {
            setNotes(n => [...n, { at: elapsed, text: note.trim() }]);
            setNote('');
          }}
        />
        {notes.map((n, i) => (
          <View key={i} style={s.card}>
            <Text style={s.label}>{duration(n.at)}</Text>
            <Text style={s.body}>{n.text}</Text>
          </View>
        ))}
      </Sheet>
      <Sheet visible={finish} onClose={() => setFinish(false)}>
        <Text style={[s.title, { textAlign: 'center' }]}>
          Session complete!
        </Text>
        <Text style={[s.body, { textAlign: 'center' }]}>{config.title}</Text>
        <View style={s.row}>
          <Stat label="Duration" value={duration(elapsed)} />
          <Stat label="Notes" value={String(notes.length)} />
        </View>
        <Field
          label="Pages read"
          keyboardType="number-pad"
          value={pages}
          onChangeText={setPages}
        />
        <Button title="Save Session" onPress={save} />
        <Button
          title="Keep reading"
          secondary
          onPress={() => {
            setFinish(false);
            setRunning(true);
          }}
        />
        <Button
          title="Discard"
          danger
          onPress={() =>
            Alert.alert(
              'Discard this session?',
              'The timer and notes will not be saved.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Discard',
                  style: 'destructive',
                  onPress: () => setLeaving(true),
                },
              ],
            )
          }
        />
      </Sheet>
    </ImageBackground>
  );
}
export function Sessions({ navigation }: Props<'Sessions'>) {
  const { state, update } = useStore();
  const total = state.sessions.reduce((a, b) => a + b.duration, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return {
      label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      minutes: state.sessions
        .filter(x => new Date(x.createdAt).toDateString() === d.toDateString())
        .reduce((a, b) => a + b.duration / 60, 0),
    };
  });
  const max = Math.max(1, ...days.map(d => d.minutes));
  return (
    <Screen>
      <Header title="Reading Sessions" back={() => navigation.goBack()} />
      <View style={s.row}>
        <Stat
          label="Total reading"
          value={`${Math.floor(total / 3600)}h ${Math.floor(
            (total % 3600) / 60,
          )}m`}
        />
        <Stat
          label="Avg session"
          value={
            state.sessions.length
              ? `${Math.round(total / state.sessions.length / 60)} min`
              : '—'
          }
        />
      </View>
      <View style={[s.row, { marginTop: 10 }]}>
        <Stat label="Sessions" value={String(state.sessions.length)} />
        <Stat
          label="Pages read"
          value={String(state.sessions.reduce((a, b) => a + b.pages, 0))}
        />
      </View>
      <View style={[s.card, s.section]}>
        <Text style={s.heading}>Weekly activity</Text>
        <View
          style={{
            flexDirection: 'row',
            height: 110,
            gap: 12,
            alignItems: 'flex-end',
          }}
        >
          {days.map((d, i) => (
            <View key={i} style={{ flex: 1, gap: 6, alignItems: 'center' }}>
              <View
                style={{
                  height: Math.max(3, (d.minutes / max) * 80),
                  width: '100%',
                  backgroundColor: colors.purple,
                  borderRadius: 6,
                }}
              />
              <Text style={s.small}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={s.section}>
        <Text style={s.label}>History</Text>
        {state.sessions.length === 0 ? (
          <Empty
            title="No sessions yet"
            description="Start the timer and your history will grow here."
          />
        ) : (
          state.sessions.map(session => (
            <View key={session.id} style={s.card}>
              <View style={s.between}>
                <View style={{ flex: 1 }}>
                  <Text style={s.heading}>{session.title}</Text>
                  <Text style={s.small}>
                    {new Date(session.createdAt).toLocaleString()}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="Delete session"
                  hitSlop={12}
                  onPress={() =>
                    Alert.alert(
                      'Delete session?',
                      'This session will be removed from your history and stats. Book progress stays unchanged.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () =>
                            update(st => ({
                              ...st,
                              sessions: st.sessions.filter(
                                x => x.id !== session.id,
                              ),
                            })),
                        },
                      ],
                    )
                  }
                >
                  <Text style={{ color: colors.danger }}>×</Text>
                </Pressable>
              </View>
              <Text style={s.label}>
                {duration(session.duration)} · {session.pages} pages
              </Text>
              {session.notes.map((n, i) => (
                <Text key={i} style={s.body}>
                  {duration(n.at)} · {n.text}
                </Text>
              ))}
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}
