import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  ImageProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { NavigationContext } from '@react-navigation/native';

export function useMotionEnabled() {
  const navigation = useContext(NavigationContext);
  const [reduced, setReduced] = useState(true);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [focused, setFocused] = useState(navigation?.isFocused() ?? true);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (mounted) setReduced(value);
      })
      .catch(() => {});
    const accessibility = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    );
    const app = AppState.addEventListener('change', value =>
      setActive(value === 'active'),
    );
    const focus = navigation?.addListener('focus', () => setFocused(true));
    const blur = navigation?.addListener('blur', () => setFocused(false));
    return () => {
      mounted = false;
      accessibility.remove();
      app.remove();
      focus?.();
      blur?.();
    };
  }, [navigation]);
  return !reduced && active && focused;
}

export function PageReveal({
  children,
  style,
  animationKey = 0,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  animationKey?: string | number;
}) {
  const enabled = useMotionEnabled();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!enabled) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [enabled, progress, animationKey]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function StoryArt(props: ImageProps) {
  const enabled = useMotionEnabled();
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) {
      float.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [enabled, float]);
  return (
    <Animated.Image
      {...props}
      style={[
        props.style,
        {
          transform: [
            {
              translateY: float.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -5],
              }),
            },
            {
              rotate: float.interpolate({
                inputRange: [0, 1],
                outputRange: ['-0.6deg', '0.6deg'],
              }),
            },
          ],
        },
      ]}
    />
  );
}

export function StorySparkles() {
  const enabled = useMotionEnabled();
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) {
      shimmer.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 3300,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 3300,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [enabled, shimmer]);
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={StyleSheet.absoluteFill}
    >
      {[12, 38, 69, 88].map((left, i) => (
        <Animated.Text
          key={left}
          style={{
            position: 'absolute',
            left: `${left}%`,
            top: 24 + i * 51,
            color: i % 2 ? '#91DFFE' : '#F4B5F3',
            fontSize: i % 2 ? 7 : 11,
            opacity: shimmer.interpolate({
              inputRange: [0, 1],
              outputRange: i % 2 ? [0.25, 0.08] : [0.08, 0.3],
            }),
            transform: [
              {
                translateY: shimmer.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -8],
                }),
              },
            ],
          }}
        >
          ✦
        </Animated.Text>
      ))}
    </View>
  );
}
