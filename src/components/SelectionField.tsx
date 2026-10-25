import React, { useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors, styles as s } from '../theme';
import { Chips, Sheet } from './UI';

type Option<T> = { label: string; value: T };
export function SelectionField<T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Choose an option',
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value);
  return (
    <View style={{ gap: 6, minWidth: 0 }}>
      <Text style={s.small}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label || placeholder}`}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          Keyboard.dismiss();
          setOpen(v => !v);
        }}
        style={[s.input, s.between]}
      >
        <Text
          style={{
            color: selected ? colors.text : colors.muted,
            flex: 1,
            fontSize: 14,
          }}
        >
          {selected?.label || placeholder}
        </Text>
        <ChevronDown size={17} color={colors.muted} />
      </Pressable>
      {open && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          {options.map(option => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: option.value === value }}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              style={[
                s.between,
                {
                  padding: 13,
                  minHeight: 46,
                  backgroundColor:
                    option.value === value ? colors.purple : 'transparent',
                },
              ]}
            >
              <Text style={{ color: colors.text, flex: 1, fontSize: 14 }}>
                {option.label}
              </Text>
              {option.value === value && (
                <Check size={17} color={colors.pink} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
export const minuteOptions = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 180].map(
  value => ({ value, label: `${value} min` }),
);
export const secondOptions = [30, 60, 90].map(value => ({
  value,
  label: `${value} sec`,
}));
const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
const displayDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};
const afterDays = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};
export function DateSelectionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => afterDays(1).getMonth());
  const [year, setYear] = useState(() => afterDays(1).getFullYear());
  const today = isoDate(new Date());
  const years = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() + i,
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(2026, i, 1).toLocaleDateString('en-US', { month: 'short' }),
  );
  const dates = Array.from(
    { length: new Date(year, month + 1, 0).getDate() },
    (_, i) => new Date(year, month, i + 1, 12),
  ).filter(date => isoDate(date) > today);
  const choose = (date: Date) => {
    onChange(isoDate(date));
    setOpen(false);
  };
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.small}>Target finish date</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose target finish date"
        onPress={() => {
          Keyboard.dismiss();
          const selected =
            value && value > today ? parseDate(value) : afterDays(1);
          setMonth(selected.getMonth());
          setYear(selected.getFullYear());
          setOpen(true);
        }}
        style={[s.input, s.between]}
      >
        <Text style={{ color: value ? colors.text : colors.muted, flex: 1 }}>
          {value ? displayDate(parseDate(value)) : 'Choose a date'}
        </Text>
        <ChevronDown size={17} color={colors.muted} />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)}>
        <Text style={s.heading}>Choose your finish date</Text>
        <Text style={s.small}>Quick options</Text>
        <View style={{ gap: 6 }}>
          {[1, 7, 14, 30, 60, 90].map(days => (
            <Pressable
              key={days}
              accessibilityRole="button"
              onPress={() => choose(afterDays(days))}
              style={[s.chip, { minHeight: 44, justifyContent: 'center' }]}
            >
              <Text style={{ color: colors.text }}>
                {days === 1 ? 'Tomorrow' : `In ${days} days`} ·{' '}
                {displayDate(afterDays(days))}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.small}>Or choose from the date list</Text>
        <Chips options={years} value={year} onChange={setYear} />
        <Chips
          options={months}
          value={months[month]}
          onChange={name => setMonth(months.indexOf(name))}
        />
        {dates.length === 0 ? (
          <Text style={s.body}>
            Choose a future month to see available dates.
          </Text>
        ) : (
          dates.map(date => (
            <Pressable
              key={isoDate(date)}
              accessibilityRole="radio"
              accessibilityState={{ checked: value === isoDate(date) }}
              onPress={() => choose(date)}
              style={[s.input, s.between]}
            >
              <Text style={{ color: colors.text, flex: 1 }}>
                {displayDate(date)}
              </Text>
              {value === isoDate(date) && (
                <Check size={18} color={colors.pink} />
              )}
            </Pressable>
          ))
        )}
      </Sheet>
    </View>
  );
}
