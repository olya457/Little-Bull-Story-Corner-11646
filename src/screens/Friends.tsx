import { SelectionField, secondOptions } from '../components/SelectionField';
import { StoryArt, PageReveal } from '../components/Motion';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Alert,
  AppState,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { GradientSurface as LinearGradient } from '../components/GradientSurface';
import { usePreventRemove } from '@react-navigation/native';
import { assets } from '../assets';
import { words } from '../data/words';
import { Button, Chips, Field, Header, Screen, Sheet } from '../components/UI';
import { Props, TabProps } from '../navigation/types';
import { styles as s, colors } from '../theme';
import { shuffle } from '../utils/calculations';
import { useClock } from '../utils/useClock';
const teamColors = [colors.pink, colors.cyan, '#F3BE65', colors.green];
export function Friends({ navigation }: TabProps<'Friends'>) {
  return (
    <Screen>
      <Header title="Game With Friends" subtitle="Party game for teams" />
      <LinearGradient
        colors={['#301660', '#150D35']}
        style={[s.card, s.center]}
      >
        <StoryArt
          source={assets.onboard[2]}
          style={{ width: 230, height: 200 }}
        />
        <Text style={[s.title, { fontFamily: 'Georgia', fontSize: 25 }]}>
          Explain It, Little Bull!
        </Text>
        <Text style={[s.body, { textAlign: 'center' }]}>
          Describe words. Race the clock. Win glory.
        </Text>
      </LinearGradient>
      <View style={s.section}>
        <Text style={s.label}>How to play</Text>
        {[
          ['Split into teams', 'Two to four teams take turns each round.'],
          [
            'Explain the word',
            'Give player descriptions without saying the word itself.',
          ],
          [
            'Guess or Skip',
            'Each correct guess is a point. A new word appears instantly.',
          ],
          ['Beat the clock', 'When time runs out, the next team takes over.'],
        ].map(([title, body], i) => (
          <View key={title} style={[s.card, s.row, { padding: 14 }]}>
            <View
              style={{
                backgroundColor: teamColors[i],
                width: 28,
                height: 28,
                borderRadius: 9,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.heading, { fontSize: 15 }]}>{title}</Text>
              <Text style={s.small}>{body}</Text>
            </View>
          </View>
        ))}
        <Button
          title="Start Game"
          onPress={() => navigation.navigate('GameSetup')}
        />
      </View>
    </Screen>
  );
}
export function GameSetup({ navigation }: Props<'GameSetup'>) {
  const { width, fontScale } = useWindowDimensions();
  const narrow = width < 390 || fontScale > 1.15;
  const [count, setCount] = useState(3);
  const [names, setNames] = useState(['', '', '', '']);
  const [rounds, setRounds] = useState(3);
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState('');
  const start = () => {
    const active = names.slice(0, count).map(n => n.trim());
    if (active.some(n => !n)) return setError('Enter a name for each team.');
    if (new Set(active.map(n => n.toLowerCase())).size < count)
      return setError('Each team needs a different name.');
    navigation.navigate('Game', { names: active, rounds, seconds });
  };
  return (
    <Screen>
      <Header
        title="Game Setup"
        subtitle="Friends Game"
        back={() => navigation.goBack()}
      />
      <Text style={s.small}>
        {count} teams · {rounds} rounds · {seconds}s turns · ~
        {Math.ceil((count * rounds * seconds) / 60)} min
      </Text>
      <View style={s.section}>
        <Text style={s.label}>Number of teams</Text>
        <Chips options={[2, 3, 4]} value={count} onChange={setCount} />
        <Text style={s.label}>Team names</Text>
        {names.slice(0, count).map((name, i) => (
          <View key={i} style={s.row}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: teamColors[i],
              }}
            />
            <Field
              value={name}
              placeholder={`Team ${i + 1} name`}
              maxLength={24}
              onChangeText={v =>
                setNames(n => n.map((x, j) => (j === i ? v : x)))
              }
            />
          </View>
        ))}
        <View
          style={[
            s.card,
            s.between,
            narrow && { flexDirection: 'column', alignItems: 'stretch' },
          ]}
        >
          <View>
            <Text style={s.heading}>Rounds</Text>
            <Text style={s.small}>Every team plays once per round</Text>
          </View>
          <View style={s.row}>
            <Button
              title="−"
              secondary
              disabled={rounds <= 1}
              onPress={() => setRounds(r => r - 1)}
            />
            <Text style={s.heading}>{rounds}</Text>
            <Button
              title="＋"
              secondary
              disabled={rounds >= 10}
              onPress={() => setRounds(r => r + 1)}
            />
          </View>
        </View>

        <SelectionField
          label="Time per turn"
          options={secondOptions}
          value={seconds}
          onChange={setSeconds}
        />
        {!!error && <Text style={{ color: colors.danger }}>{error}</Text>}
        <Button title="Let’s Play" onPress={start} />
      </View>
    </Screen>
  );
}
export function Game({ navigation, route }: Props<'Game'>) {
  const { names, rounds, seconds } = route.params;
  const { height } = useWindowDimensions();
  const compact = height < 730;
  const [scores, setScores] = useState(names.map(() => 0));
  const [skips, setSkips] = useState(names.map(() => 0));
  const [turn, setTurn] = useState(0);
  const [stage, setStage] = useState<'handoff' | 'playing' | 'results'>(
    'handoff',
  );
  const [paused, setPaused] = useState(false);
  const [deck, setDeck] = useState(() => shuffle(words));
  const [word, setWord] = useState(0);
  const [turnScore, setTurnScore] = useState(0);
  const [version, setVersion] = useState(0);
  const [exit, setExit] = useState(false);
  const time = useClock(stage === 'playing' && !paused, `${version}-${turn}`);
  const remaining = Math.max(0, seconds - time);
  const team = turn % names.length;
  const round = Math.floor(turn / names.length) + 1;
  const ended = useRef(false);
  usePreventRemove(stage !== 'results' && !exit, ({ data }) => {
    setPaused(true);
    Alert.alert('Leave game?', 'This game’s results will be discarded.', [
      { text: 'Resume', style: 'cancel', onPress: () => setPaused(false) },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });
  useEffect(() => {
    if (exit) navigation.goBack();
  }, [exit, navigation]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', v => {
      if (v !== 'active') setPaused(true);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (stage === 'playing' && remaining === 0 && !ended.current) {
      ended.current = true;
      if (word + 1 === deck.length) {
        setDeck(shuffle(words));
        setWord(0);
      } else setWord(w => w + 1);
      if (turn + 1 >= names.length * rounds) setStage('results');
      else {
        setTurn(t => t + 1);
        setStage('handoff');
      }
    }
  }, [stage, remaining, turn, names.length, rounds, word, deck.length]);
  const advance = (guessed: boolean) => {
    if (remaining <= 0 || paused) return;
    if (guessed) {
      setScores(a => a.map((n, i) => (i === team ? n + 1 : n)));
      setTurnScore(n => n + 1);
    } else setSkips(a => a.map((n, i) => (i === team ? n + 1 : n)));
    if (word + 1 === deck.length) {
      setDeck(shuffle(words));
      setWord(0);
    } else setWord(w => w + 1);
  };
  const restart = () => {
    setScores(names.map(() => 0));
    setSkips(names.map(() => 0));
    setTurn(0);
    setTurnScore(0);
    setStage('handoff');
    setPaused(false);
    setDeck(shuffle(words));
    setWord(0);
    setVersion(v => v + 1);
  };
  if (stage === 'results') {
    const rankings = names
      .map((name, i) => ({ name, score: scores[i], skips: skips[i], i }))
      .sort((a, b) => b.score - a.score);
    const winners = rankings.filter(t => t.score === rankings[0].score);
    return (
      <Screen>
        <LinearGradient
          colors={['#3F1F75', '#160D31']}
          style={[s.card, s.center, { paddingTop: 25 }]}
        >
          <Text style={s.label}>
            {winners.length > 1 ? 'It’s a tie!' : 'Winner'}
          </Text>
          <StoryArt
            source={assets.bulls[0]}
            style={{ width: 190, height: 190 }}
          />
          <Text
            style={[
              s.title,
              {
                fontFamily: 'Georgia',
                textAlign: 'center',
                color: colors.pink,
              },
            ]}
          >
            {winners.map(w => w.name).join(' & ')}
          </Text>
          <Text style={s.body}>{rankings[0].score} words guessed</Text>
        </LinearGradient>
        <View style={s.section}>
          <Text style={s.label}>Final rankings</Text>
          {rankings.map((t, i) => (
            <View
              key={t.i}
              style={[s.card, s.between, { borderColor: teamColors[t.i] }]}
            >
              <View style={s.row}>
                <Text style={s.heading}>{i + 1}</Text>
                <View>
                  <Text style={s.heading}>{t.name}</Text>
                  <Text style={s.small}>
                    {t.score} guessed · {t.skips} skipped
                  </Text>
                </View>
              </View>
              <Text style={s.heading}>{t.score} pts</Text>
            </View>
          ))}
          <Button title="Play Again" onPress={restart} />
          <Button
            title="New Setup"
            secondary
            onPress={() => navigation.replace('GameSetup')}
          />
          <Button
            title="Done"
            secondary
            onPress={() => navigation.popToTop()}
          />
        </View>
      </Screen>
    );
  }
  return (
    <Screen scroll={false} animationKey={`${stage}-${turn}`}>
      <View style={s.between}>
        <Pressable onPress={() => setPaused(true)} style={s.chip}>
          <Text style={s.body}>Ⅱ</Text>
        </Pressable>
        <Text style={s.small}>
          Round {round} of {rounds}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: teamColors[team],
            fontSize: 12,
            flexShrink: 1,
            textAlign: 'right',
          }}
        >
          {names[team]}
        </Text>
      </View>
      {stage === 'handoff' ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingVertical: compact ? 12 : 24,
            gap: 20,
          }}
        >
          <View
            style={[
              s.center,
              { gap: compact ? 10 : 16, marginTop: compact ? 0 : 20 },
            ]}
          >
            <Text style={s.label}>Up next</Text>
            <Text
              style={[
                s.title,
                {
                  fontFamily: 'Georgia',
                  fontSize: compact ? 30 : 40,
                  textAlign: 'center',
                  color: teamColors[team],
                },
              ]}
            >
              {names[team]}
            </Text>
            <StoryArt
              source={assets.bulls[0]}
              style={{
                width: compact ? 125 : 175,
                height: compact ? 125 : 175,
              }}
            />
            <Text style={[s.body, { textAlign: 'center' }]}>
              Pass the phone to your explainer.{'\n'}Teammates — get ready to
              shout!
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {names.map((n, i) => (
                <Text key={n} style={{ fontSize: 11, color: teamColors[i] }}>
                  ● {n} {scores[i]}
                </Text>
              ))}
            </View>
          </View>
          <View style={{ gap: 12 }}>
            <Button
              title="Start Turn"
              onPress={() => {
                ended.current = false;
                setTurnScore(0);
                setStage('playing');
              }}
            />
            <Button
              title="End game & see results"
              secondary
              onPress={() => setStage('results')}
            />
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingVertical: compact ? 12 : 24,
            gap: 20,
          }}
        >
          <View style={{ gap: compact ? 16 : 25 }}>
            <View
              style={{
                height: compact ? 155 : 190,
                width: compact ? 155 : 190,
                borderRadius: 100,
                borderWidth: 7,
                borderColor: remaining < 10 ? colors.danger : teamColors[team],
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 66,
                  color: 'white',
                  fontWeight: '300',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {remaining}
              </Text>
              <Text style={s.label}>Seconds</Text>
            </View>
            <PageReveal animationKey={word}>
              <LinearGradient
                colors={['#302941', '#171224']}
                style={[s.card, s.center, { minHeight: compact ? 120 : 150 }]}
              >
                <Text style={s.label}>Explain this word</Text>
                <Text
                  style={[
                    s.title,
                    {
                      fontFamily: 'Georgia',
                      fontSize: 32,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {paused ? '•••' : deck[word]}
                </Text>
                <Text style={s.small}>Don’t say the word or its parts</Text>
              </LinearGradient>
            </PageReveal>
            <Text style={[s.body, { textAlign: 'right' }]}>
              This turn / total {turnScore} / {scores[team]}
            </Text>
          </View>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Button title="Skip" danger onPress={() => advance(false)} />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => advance(true)}
              style={{
                flex: 1,
                backgroundColor: colors.green,
                padding: 17,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color: '#093E23',
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                Guessed!
              </Text>
            </Pressable>
          </View>
        </View>
      )}
      <Sheet visible={paused} onClose={() => setPaused(false)}>
        <Text style={[s.title, { textAlign: 'center' }]}>Game paused</Text>
        <Text style={[s.body, { textAlign: 'center' }]}>
          {names[team]} · {remaining}s left · word hidden
        </Text>
        <Button title="Resume" onPress={() => setPaused(false)} />
        <Button
          title="End game"
          secondary
          onPress={() => {
            setPaused(false);
            setStage('results');
          }}
        />
        <Button
          title="Quit without results"
          danger
          onPress={() => {
            setPaused(false);
            setExit(true);
          }}
        />
      </Sheet>
    </Screen>
  );
}
