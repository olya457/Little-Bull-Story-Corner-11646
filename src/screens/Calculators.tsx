import {
  DateSelectionField,
  SelectionField,
  minuteOptions,
} from '../components/SelectionField';
import { StoryArt, PageReveal } from '../components/Motion';
import React, { useState } from 'react';
import { View, Text, Share, Alert, Pressable } from 'react-native';
import { GradientSurface as LinearGradient } from '../components/GradientSurface';
import { assets } from '../assets';
import {
  Button,
  Chips,
  Empty,
  Field,
  Header,
  Screen,
  Stat,
} from '../components/UI';
import { Props, TabProps } from '../navigation/types';
import { styles as s, colors } from '../theme';
import { uid, useStore } from '../store/AppStore';
import { daysBetween, positive, readingTime } from '../utils/calculations';
type Result = {
  kind: string;
  value: string;
  detail: string;
  bars: number[];
  stats: [string, string][];
};
const kinds = ['Pages / Day', 'Finish Date', 'Reading Time'];
export function Calculators({ navigation }: TabProps<'Calculators'>) {
  const { state, update } = useStore();
  const [kind, setKind] = useState(kinds[0]);
  const [total, setTotal] = useState('');
  const [current, setCurrent] = useState('');
  const [date, setDate] = useState('');
  const [remaining, setRemaining] = useState('');
  const [pace, setPace] = useState('');
  const [speed, setSpeed] = useState('');
  const [session, setSession] = useState(30);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const calculate = () => {
    try {
      let r: Result;
      if (kind === kinds[0]) {
        const t = positive(total, 'Total pages');
        const c = Number(current || 0);
        if (c < 0 || c >= t || !Number.isFinite(c))
          throw Error(
            'Current page must be between zero and total pages minus one.',
          );
        const days = daysBetween(date);
        const pages = Math.ceil((t - c) / days);
        r = {
          kind,
          value: `${pages} pages / day`,
          detail: `${t - c} pages left · ${days} days until ${date}`,
          bars: Array.from({ length: 7 }, (_, i) =>
            Math.min(100, ((c + ((t - c) * (i + 1)) / 7) / t) * 100),
          ),
          stats: [
            ['Progress now', `${Math.round((c / t) * 100)}%`],
            ['Days left', String(days)],
            ['Finish by', date.slice(5)],
          ],
        };
      } else if (kind === kinds[1]) {
        const p = positive(remaining, 'Remaining pages');
        const perDay = positive(pace, 'Pages per day');
        const days = Math.ceil(p / perDay);
        const finish = new Date();
        finish.setDate(finish.getDate() + days);
        r = {
          kind,
          value: finish.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
          detail: `In ${days} days · ${finish.getFullYear()} · ${p} pages left`,
          bars: Array.from(
            { length: Math.min(10, Math.ceil(days / 7)) },
            (_, i) => Math.min(100, (((i + 1) * 7) / days) * 100),
          ),
          stats: [
            ['Pages left', String(p)],
            ['Daily pace', String(perDay)],
            ['Weeks', String(Math.ceil(days / 7))],
          ],
        };
      } else {
        const p = positive(remaining, 'Remaining pages');
        const sp = positive(speed, 'Reading speed');
        const se = positive(String(session), 'Session minutes');
        const time = readingTime(p, sp, se);
        r = {
          kind,
          value: `${Math.floor(time.minutes / 60)}h ${time.minutes % 60}m`,
          detail: `${time.sessions} sessions of ${se} min · ${p} pages at ${sp} pages/h`,
          bars: Array.from({ length: Math.min(time.sessions, 16) }, () => 90),
          stats: [
            ['Speed', `${sp} p/h`],
            ['Per session', `${Math.floor((sp * se) / 60)} pages`],
            ['Sessions', String(time.sessions)],
          ],
        };
      }
      setError('');
      setResult(r);
      setSaved(false);
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  };
  return (
    <Screen>
      <Header
        title="Calculators"
        subtitle="Plan your reading"
        action={
          <Button
            title={`Saved ${state.calculations.length}`}
            secondary
            onPress={() => navigation.navigate('SavedCalculations')}
          />
        }
      />
      <Chips
        options={kinds}
        value={kind}
        onChange={v => {
          setKind(v);
          setResult(null);
          setError('');
        }}
      />
      <View style={[s.card, s.section]}>
        <Text style={s.heading}>{kind}</Text>
        <Text style={s.small}>
          {kind === kinds[0]
            ? 'How many pages you need daily to finish by a date.'
            : kind === kinds[1]
            ? 'When you’ll finish at your current pace.'
            : 'Hours and sessions left until the last page.'}
        </Text>
        {kind === kinds[0] ? (
          <>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Total pages"
                  value={total}
                  onChangeText={setTotal}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Current page"
                  value={current}
                  onChangeText={setCurrent}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <DateSelectionField value={date} onChange={setDate} />
          </>
        ) : (
          <>
            <Field
              label="Remaining pages"
              value={remaining}
              onChangeText={setRemaining}
              keyboardType="number-pad"
            />
            {kind === kinds[1] ? (
              <Field
                label="Average pages per day"
                value={pace}
                onChangeText={setPace}
                keyboardType="decimal-pad"
              />
            ) : (
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Speed (pages/hr)"
                    value={speed}
                    onChangeText={setSpeed}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <SelectionField
                    label="Session duration"
                    value={session}
                    onChange={setSession}
                    options={minuteOptions}
                  />
                </View>
              </View>
            )}
          </>
        )}
        {!!error && <Text style={{ color: colors.danger }}>{error}</Text>}
        <Button title="Calculate" onPress={calculate} />
      </View>
      {result ? (
        <PageReveal animationKey={result.value}>
          <LinearGradient
            colors={['#126C9C', '#18558B']}
            style={[s.card, s.section]}
          >
            <View style={s.row}>
              <StoryArt
                source={assets.logo}
                style={{ width: 45, height: 45, borderRadius: 25 }}
              />
              <Text style={[s.body, { flex: 1 }]}>
                A chapter a day keeps the deadline away.
              </Text>
            </View>
            <Text style={s.label}>{result.kind}</Text>
            <Text style={[s.title, { fontSize: 36 }]}>{result.value}</Text>
            <Text style={s.body}>{result.detail}</Text>
            <View style={[s.card, { backgroundColor: '#153C79' }]}>
              <Text style={s.small}>Projected reading progress</Text>
              <View
                style={{
                  height: 100,
                  flexDirection: 'row',
                  gap: 6,
                  alignItems: 'flex-end',
                }}
              >
                {result.bars.map((b, i) => (
                  <LinearGradient
                    key={i}
                    colors={
                      i === result.bars.length - 1
                        ? ['#FFE28A', '#FFAE57']
                        : ['#79E6F0', '#3972DF']
                    }
                    style={{
                      flex: 1,
                      height: `${Math.max(10, b)}%`,
                      borderRadius: 6,
                    }}
                  />
                ))}
              </View>
            </View>
            <View style={s.row}>
              {result.stats.map(([label, value]) => (
                <Stat key={label} label={label} value={value} />
              ))}
            </View>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Button
                  title={saved ? 'Saved ✓' : 'Save'}
                  disabled={saved}
                  onPress={() => {
                    update(st => ({
                      ...st,
                      calculations: [
                        {
                          id: uid(),
                          kind: result.kind,
                          value: result.value,
                          detail: result.detail,
                          createdAt: new Date().toISOString(),
                        },
                        ...st.calculations,
                      ],
                    }));
                    setSaved(true);
                  }}
                />
              </View>
              <Button
                title="Share"
                secondary
                onPress={() => {
                  Share.share({
                    message: `${result.kind}: ${result.value}\n${result.detail}\nBully Tales`,
                  }).catch(() => Alert.alert('Unable to share'));
                }}
              />
              <Button title="Clear" secondary onPress={() => setResult(null)} />
            </View>
          </LinearGradient>
        </PageReveal>
      ) : (
        <View style={{ marginTop: 22 }}>
          <Empty
            title="Your result appears here"
            description="Fill in the fields and tap Calculate. Bully Tales will crunch the numbers."
          />
        </View>
      )}
    </Screen>
  );
}
export function SavedCalculations({ navigation }: Props<'SavedCalculations'>) {
  const { state, update } = useStore();
  return (
    <Screen>
      <Header
        title="Saved Calculations"
        subtitle={`${state.calculations.length} saved results`}
        back={() => navigation.goBack()}
      />
      {state.calculations.length === 0 ? (
        <Empty
          title="Nothing saved yet"
          description="Save a calculation to revisit it here."
        />
      ) : (
        state.calculations.map(c => (
          <View key={c.id} style={[s.card, { marginBottom: 12 }]}>
            <View style={s.between}>
              <Text style={s.label}>{c.kind}</Text>
              <Pressable
                accessibilityLabel="Delete calculation"
                hitSlop={10}
                onPress={() =>
                  Alert.alert(
                    'Delete calculation?',
                    'Remove this saved result?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () =>
                          update(st => ({
                            ...st,
                            calculations: st.calculations.filter(
                              x => x.id !== c.id,
                            ),
                          })),
                      },
                    ],
                  )
                }
              >
                <Text style={s.body}>×</Text>
              </Pressable>
            </View>
            <Text style={s.heading}>{c.value}</Text>
            <Text style={s.small}>{c.detail}</Text>
            <Text style={s.small}>
              {new Date(c.createdAt).toLocaleString()}
            </Text>
            <Button
              title="Share"
              secondary
              onPress={() => {
                Share.share({
                  message: `${c.kind}: ${c.value}\n${c.detail}`,
                }).catch(() => Alert.alert('Unable to share'));
              }}
            />
          </View>
        ))
      )}
    </Screen>
  );
}
