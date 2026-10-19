import React, { useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInputProps,
  Animated,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { GradientSurface } from './GradientSurface';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PageReveal,
  StoryArt,
  StorySparkles,
  useMotionEnabled,
} from './Motion';
import { assets } from '../assets';
import { colors, gradient, styles as s } from '../theme';
export function Screen({
  children,
  scroll = true,
  animationKey = 0,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  animationKey?: string | number;
}) {
  const { width, height, fontScale } = useWindowDimensions();
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const compact = width < 375 || height < 700;
  const scrollable = scroll || compact || fontScale > 1.15;
  const contentStyle = [
    ui.content,
    { padding: compact ? 14 : 20, paddingBottom: compact ? 20 : 32 },
  ];
  return (
    <GradientSurface
      colors={['#211548', '#0C0926', '#09071F']}
      locations={[0, 0.28, 1]}
      style={{ flex: 1 }}
    >
      <StorySparkles />
      <SafeAreaView
        edges={
          tabBarHeight === undefined
            ? ['top', 'bottom', 'left', 'right']
            : ['top', 'left', 'right']
        }
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {scrollable ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <PageReveal
                animationKey={animationKey}
                style={[contentStyle, { flexGrow: 1 }]}
              >
                {children}
              </PageReveal>
            </ScrollView>
          ) : (
            <PageReveal
              animationKey={animationKey}
              style={[contentStyle, { flex: 1 }]}
            >
              {children}
            </PageReveal>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientSurface>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  danger = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  const enabled = useMotionEnabled();
  const scale = useRef(new Animated.Value(1)).current;
  const press = (value: number) => {
    if (enabled)
      Animated.spring(scale, {
        toValue: value,
        useNativeDriver: true,
        speed: 28,
        bounciness: 5,
      }).start();
  };
  useEffect(() => {
    if (!enabled) scale.setValue(1);
    return () => scale.stopAnimation();
  }, [enabled, scale]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => press(0.97)}
      onPressOut={() => press(1)}
      style={({ pressed }) => ({
        opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        minHeight: 56,
        flexShrink: 1,
      })}
    >
      <Animated.View
        style={[
          ui.button,
          !secondary && !danger && ui.glow,
          { transform: [{ scale }] },
        ]}
      >
        <LinearGradient
          pointerEvents="none"
          colors={
            danger
              ? ['#7B2249', '#49233E']
              : secondary
              ? [colors.field, colors.field]
              : gradient
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        />
        <Text
          style={{
            color: danger ? '#FF98B7' : colors.text,
            fontSize: 14,
            lineHeight: 20,
            fontWeight: '600',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
export function Header({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  back?: () => void;
}) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = Boolean(action) && (width < 360 || fontScale > 1.2);
  return (
    <View
      style={[
        s.between,
        { marginBottom: 18 },
        stacked && { flexDirection: 'column', alignItems: 'stretch' },
      ]}
    >
      <View style={[s.row, { flex: 1 }]}>
        {back && (
          <Pressable
            accessibilityLabel="Go back"
            onPress={back}
            style={ui.back}
          >
            <Text style={{ color: colors.text, fontSize: 27 }}>‹</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          {subtitle && <Text style={s.small}>{subtitle}</Text>}
          <Text style={[s.title, { fontSize: width < 375 ? 24 : 28 }]}>
            {title}
          </Text>
        </View>
      </View>
      {action}
    </View>
  );
}
export function Field({
  label,
  ...props
}: TextInputProps & { label?: string }) {
  return (
    <View style={{ gap: 6, flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
      {label && <Text style={s.small}>{label}</Text>}
      <TextInput
        placeholderTextColor="#77708F"
        selectionColor={colors.pink}
        {...props}
        style={[
          s.input,
          props.multiline && { minHeight: 96, textAlignVertical: 'top' },
          props.style,
        ]}
      />
    </View>
  );
}
export function Chips<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
      {options.map(option => (
        <Pressable
          key={option}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option }}
          onPress={() => onChange(option)}
          style={[
            s.chip,
            value === option && { backgroundColor: colors.purple },
          ]}
        >
          <Text style={[s.chipText, value === option && { color: 'white' }]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <View
      style={[
        s.center,
        {
          padding: 30,
          gap: 10,
          minHeight: 230,
          borderWidth: 1,
          borderColor: colors.border,
          borderStyle: 'dashed',
          borderRadius: 22,
        },
      ]}
    >
      <StoryArt
        source={assets.logo}
        style={{ width: 82, height: 82, borderRadius: 41 }}
      />
      <Text style={[s.heading, { textAlign: 'center', fontSize: 16 }]}>
        {title}
      </Text>
      <Text style={[s.body, { textAlign: 'center', fontSize: 12 }]}>
        {description}
      </Text>
      {action}
    </View>
  );
}
export function Progress({ value }: { value: number }) {
  const enabled = useMotionEnabled();
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0)),
      duration: enabled ? 550 : 0,
      useNativeDriver: false,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [value, enabled, progress]);
  return (
    <View
      style={{
        height: 6,
        backgroundColor: '#FFFFFF18',
        borderRadius: 5,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          height: 6,
          width: progress.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 6, width: '100%' }}
        />
      </Animated.View>
    </View>
  );
}
export function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { height, width } = useWindowDimensions();
  const motion = useMotionEnabled();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={motion ? 'slide' : 'none'}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: '#050315BB',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          accessibilityLabel="Close dialog"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <SafeAreaView
            edges={['bottom']}
            style={{
              backgroundColor: '#211A45',
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              maxHeight: height * 0.85,
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: width < 375 ? 16 : 22,
                gap: 16,
              }}
            >
              <View
                style={{
                  height: 4,
                  width: 36,
                  borderRadius: 4,
                  backgroundColor: '#75678F',
                  alignSelf: 'center',
                }}
              />
              {children}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={[s.card, { flex: 1, minWidth: 0, padding: 10, borderRadius: 14 }]}
    >
      <Text style={[s.heading, { fontSize: 19 }]}>{value}</Text>
      <Text style={s.small}>{label}</Text>
    </View>
  );
}
const ui = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 4,
    width: '100%',
    maxWidth: 660,
    alignSelf: 'center',
  },
  button: {
    minHeight: 56,
    flexShrink: 0,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
  },
  glow: {
    shadowColor: '#EE49DA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 4,
  },
  back: {
    height: 40,
    width: 40,
    borderRadius: 22,
    backgroundColor: '#FFFFFF0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
