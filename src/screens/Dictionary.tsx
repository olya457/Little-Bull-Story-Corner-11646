import { SelectionField, secondOptions } from '../components/SelectionField';
import { StoryArt } from '../components/Motion';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Alert,
  AppState,
} from 'react-native';
import { GradientSurface as LinearGradient } from '../components/GradientSurface';
import { usePreventRemove } from '@react-navigation/native';
import terms from '../data/terms.json';
import tasks from '../data/quizzes.json';
import { assets } from '../assets';
import {
  Button,
  Chips,
  Empty,
  Field,
  Header,
  Progress,
  Screen,
  Sheet,
  Stat,
} from '../components/UI';
import { Props, TabProps } from '../navigation/types';
import { styles as s, colors } from '../theme';
import { useStore } from '../store/AppStore';
import { duration, shuffle } from '../utils/calculations';
import { useClock } from '../utils/useClock';
export function Dictionary({ navigation }: TabProps<'Dictionary'>) {
  const { width, fontScale } = useWindowDimensions();
  const stackQuizFooter = width < 360 || fontScale > 1.2;
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [setup, setSetup] = useState(false);
  const [count, setCount] = useState(5);
  const [seconds, setSeconds] = useState(60);
  const categories = ['All', ...new Set(terms.map(t => t.category))];
  const filtered = terms.filter(
    t =>
      (category === 'All' || t.category === category) &&
      `${t.title} ${t.definition}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Screen>
      <Header
        title="Dictionary"
        subtitle={`${terms.length} terms · Literary learning`}
      />
      <Field
        placeholder="⌕  Search terms"
        value={search}
        onChangeText={setSearch}
      />
      {!search && (
        <LinearGradient
          colors={['#932CE9', '#EE40BF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.card, { marginTop: 16 }]}
        >
          <Text style={[s.label, { color: 'white' }]}>Game mode</Text>
          <Text style={[s.title, { fontSize: 25 }]}>Match Quiz</Text>
          <Text style={{ color: '#F3D9FF', lineHeight: 20, fontSize: 13 }}>
            Match each term with its meaning. One answer is a sneaky decoy!
          </Text>
          <View
            style={[
              s.between,
              stackQuizFooter && {
                flexDirection: 'column',
                alignItems: 'stretch',
              },
            ]}
          >
            <View>
              <Text style={{ color: '#F8DDFF', fontSize: 10 }}>BEST SCORE</Text>
              <Text style={{ color: 'white', fontSize: 23, fontWeight: '700' }}>
                {state.bestScore.toLocaleString()}
              </Text>
            </View>
            <Button
              title="Start Quiz"
              secondary
              onPress={() => setSetup(true)}
            />
          </View>
        </LinearGradient>
      )}
      <View style={s.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chips options={categories} value={category} onChange={setCategory} />
        </ScrollView>
        {filtered.length === 0 ? (
          <Empty
            title="No terms found"
            description="Little Bull searched every shelf. Try another word."
          />
        ) : (
          filtered.map(t => (
            <Pressable
              key={t.id}
              style={[s.card, s.row, { padding: 14 }]}
              onPress={() => navigation.navigate('Term', { id: t.id })}
            >
              <View
                style={{
                  width: 42,
                  height: 45,
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF0A',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Georgia',
                    color: colors.pink,
                    fontSize: 25,
                  }}
                >
                  {t.title[0]}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[s.heading, { fontSize: 14 }]}>{t.title}</Text>
                <Text numberOfLines={2} style={s.small}>
                  {t.definition}
                </Text>
                <Text style={[s.label, { fontSize: 8, letterSpacing: 0.8 }]}>
                  {t.category}
                </Text>
              </View>
              <Text style={s.body}>›</Text>
            </Pressable>
          ))
        )}
      </View>
      <Sheet visible={setup} onClose={() => setSetup(false)}>
        <Text style={s.heading}>Set up your quiz</Text>
        <Text style={s.body}>4 statements, 5 answers — one is a decoy.</Text>
        <Text style={s.label}>Number of tasks</Text>
        <Chips options={[3, 5, 8]} value={count} onChange={setCount} />

        <SelectionField
          label="Time per task"
          options={secondOptions}
          value={seconds}
          onChange={setSeconds}
        />
        <Text style={s.small}>
          {count} tasks · {count * 4} matches · up to{' '}
          {Math.ceil((count * seconds) / 60)} min
        </Text>
        <Button
          title="Start Quiz"
          onPress={() => {
            setSetup(false);
            navigation.navigate('Quiz', { tasks: count, seconds });
          }}
        />
      </Sheet>
    </Screen>
  );
}
export function Term({ route, navigation }: Props<'Term'>) {
  const term = terms.find(t => t.id === route.params.id);
  if (!term) return null;
  return (
    <Screen>
      <Header title="Dictionary" back={() => navigation.goBack()} />
      <LinearGradient colors={['#432571', '#291238']} style={s.card}>
        <Text style={s.label}>{term.category}</Text>
        <Text style={[s.title, { fontFamily: 'Georgia', fontSize: 32 }]}>
          {term.title}
        </Text>
        <Text style={{ color: '#DDD2ED', fontSize: 16, lineHeight: 24 }}>
          {term.definition}
        </Text>
      </LinearGradient>
      <View style={s.section}>
        <Text style={s.label}>Explanation</Text>
        <Text style={[s.body, { lineHeight: 25 }]}>{term.explanation}</Text>
        <Text style={s.label}>Example</Text>
        <View
          style={[
            s.card,
            { backgroundColor: '#121B38', borderColor: '#264365' },
          ]}
        >
          <Text style={[s.body, { color: '#B9C8E9' }]}>{term.example}</Text>
        </View>
      </View>
    </Screen>
  );
}
export function Quiz({ navigation, route }: Props<'Quiz'>) {
  const { state, update } = useStore();
  const [deck, setDeck] = useState(() =>
    shuffle(tasks)
      .slice(0, route.params.tasks)
      .map(t => ({ ...t, options: shuffle(t.options) })),
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string>();
  const [review, setReview] = useState(false);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const lock = useRef(false);
  const elapsed = useClock(!paused && !review && !done, `${attempt}-${index}`);
  const remaining = Math.max(0, route.params.seconds - elapsed);
  const task = deck[index];
  const previousBest = useRef(state.bestScore);
  const [leaving, setLeaving] = useState(false);
  usePreventRemove(!done && !leaving, ({ data }) => {
    setPaused(true);
    Alert.alert('Quit quiz?', 'This attempt will not be saved.', [
      { text: 'Continue', style: 'cancel', onPress: () => setPaused(false) },
      {
        text: 'Quit',
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });
  useEffect(() => {
    const sub = AppState.addEventListener('change', v => {
      if (v !== 'active') setPaused(true);
    });
    return () => sub.remove();
  }, []);
  const submit = () => {
    if (lock.current || done) return;
    lock.current = true;
    setCorrect(n => n + task.answers.filter((a, i) => answers[i] === a).length);
    setTotalTime(t => t + Math.min(elapsed, route.params.seconds));
    setReview(true);
  };
  useEffect(() => {
    if (remaining === 0 && !review && !paused && !done) submit();
  });
  const restart = () => {
    lock.current = false;
    setDeck(
      shuffle(tasks)
        .slice(0, route.params.tasks)
        .map(t => ({ ...t, options: shuffle(t.options) })),
    );
    setIndex(0);
    setAnswers({});
    setSelected(undefined);
    setReview(false);
    setPaused(false);
    setDone(false);
    setCorrect(0);
    setTotalTime(0);
    setAttempt(a => a + 1);
  };
  const next = () => {
    if (index === deck.length - 1) {
      const score = correct * 100;
      update(st => ({ ...st, bestScore: Math.max(st.bestScore, score) }));
      setDone(true);
    } else {
      lock.current = false;
      setIndex(i => i + 1);
      setAnswers({});
      setSelected(undefined);
      setReview(false);
    }
  };
  if (done)
    return (
      <Screen animationKey={`${attempt}-${index}-${done}`}>
        <View style={[s.center, { paddingTop: 45, gap: 22 }]}>
          <StoryArt
            source={assets.logo}
            style={{ width: 145, height: 145, borderRadius: 35 }}
          />
          <Text style={s.title}>Quiz complete!</Text>
          <Text style={s.label}>Score</Text>
          <Text style={{ fontSize: 60, color: 'white', fontWeight: '600' }}>
            {(correct * 100).toLocaleString()}
          </Text>
          <View style={{ width: '100%', gap: 12 }}>
            <Text style={s.body}>
              Accuracy · {Math.round((correct / (deck.length * 4)) * 100)}%
            </Text>
            <Progress value={(correct / (deck.length * 4)) * 100} />
            <View style={s.row}>
              <Stat label="Time" value={duration(totalTime)} />
              <Stat label="Correct" value={`${correct}/${deck.length * 4}`} />
              <Stat label="Prev. best" value={String(previousBest.current)} />
            </View>
            <Button title="Retry" onPress={restart} />
            <Button
              title="Done"
              secondary
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </Screen>
    );
  return (
    <Screen animationKey={`${attempt}-${index}-${done}`}>
      <View style={[s.between, { marginBottom: 20 }]}>
        <Button title="Ⅱ" secondary onPress={() => setPaused(true)} />
        <Text style={s.heading}>
          Task {index + 1} of {deck.length}
        </Text>
        <Text style={{ color: remaining < 10 ? colors.danger : colors.text }}>
          {duration(remaining)}
        </Text>
      </View>
      <Progress value={((index + (review ? 1 : 0)) / deck.length) * 100} />
      <Text style={[s.body, { marginVertical: 14, fontSize: 12 }]}>
        Tap an answer, then its matching statement. Tap an assigned answer to
        remove it.
      </Text>
      {task.statements.map((statement, i) => (
        <Pressable
          key={`${index}-${i}`}
          disabled={review}
          onPress={() => {
            if (selected) {
              setAnswers(a => {
                const nextAnswers = { ...a };
                Object.keys(nextAnswers).forEach(k => {
                  if (nextAnswers[Number(k)] === selected)
                    delete nextAnswers[Number(k)];
                });
                nextAnswers[i] = selected;
                return nextAnswers;
              });
              setSelected(undefined);
            } else {
              setAnswers(a => {
                const n = { ...a };
                delete n[i];
                return n;
              });
            }
          }}
          style={[
            s.card,
            {
              marginBottom: 10,
              padding: 14,
              borderColor: review
                ? answers[i] === task.answers[i]
                  ? colors.green
                  : colors.danger
                : selected
                ? colors.purple
                : colors.border,
            },
          ]}
        >
          <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>
            {i + 1}. {statement}
          </Text>
          {answers[i] ? (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: colors.purple,
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 11, color: 'white' }}>{answers[i]}</Text>
            </View>
          ) : (
            <Text style={s.small}>Tap to place a term</Text>
          )}
          {review && (
            <Text
              style={{
                color:
                  answers[i] === task.answers[i] ? colors.green : colors.danger,
                fontSize: 11,
              }}
            >
              {answers[i] === task.answers[i]
                ? '✓ Correct'
                : `✕ ${task.answers[i]}`}
            </Text>
          )}
        </Pressable>
      ))}
      <View style={s.section}>
        <View style={s.between}>
          <Text style={s.label}>Answers</Text>
          <Text style={s.small}>1 is a decoy</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          {task.options.map(option => {
            const used = Object.values(answers).includes(option);
            return (
              <Pressable
                key={option}
                disabled={review || used}
                onPress={() =>
                  setSelected(selected === option ? undefined : option)
                }
                style={[
                  s.chip,
                  {
                    opacity: used ? 0.3 : 1,
                    borderWidth: 1,
                    borderColor:
                      selected === option ? colors.pink : colors.border,
                    backgroundColor:
                      selected === option ? '#673286' : colors.field,
                  },
                ]}
              >
                <Text style={{ color: colors.text, fontSize: 12 }}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {review ? (
          <Button
            title={index === deck.length - 1 ? 'See Results' : 'Next Task'}
            onPress={next}
          />
        ) : (
          <Button
            title={`Submit Matches ${Object.keys(answers).length}`}
            disabled={Object.keys(answers).length < 4}
            onPress={submit}
          />
        )}
      </View>
      <Sheet visible={paused} onClose={() => setPaused(false)}>
        <StoryArt
          source={assets.logo}
          style={{
            width: 85,
            height: 85,
            borderRadius: 24,
            alignSelf: 'center',
          }}
        />
        <Text style={[s.title, { textAlign: 'center' }]}>Quiz paused</Text>
        <Text style={[s.body, { textAlign: 'center' }]}>
          Task {index + 1} · {duration(remaining)} left
        </Text>
        <Button title="Resume" onPress={() => setPaused(false)} />
        <Button title="Restart" secondary onPress={restart} />
        <Button
          title="Quit quiz"
          danger
          onPress={() => {
            setPaused(false);
            setLeaving(true);
          }}
        />
      </Sheet>
      {leaving && <Exit navigation={navigation} />}
    </Screen>
  );
}
function Exit({ navigation }: { navigation: Props<'Quiz'>['navigation'] }) {
  useEffect(() => navigation.goBack(), [navigation]);
  return null;
}
