import { StoryArt, StorySparkles } from '../components/Motion';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { GradientSurface as LinearGradient } from '../components/GradientSurface';
import { WebView } from 'react-native-webview';
import { assets } from '../assets';
import { Button, Screen } from '../components/UI';
import { styles as s, colors, backgroundGradient } from '../theme';
import { useStore } from '../store/AppStore';
const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;background:transparent;overflow:hidden}.track{margin:8px auto;background:#ffffff22;width:168px;height:5px;border-radius:10px;overflow:hidden}.fill{height:100%;width:0;background:linear-gradient(90deg,#ffe28a,#ffd166,#ffae57);animation:load 4s linear forwards}@keyframes load{to{width:100%}}p{font:12px -apple-system,Arial;color:#d3e6ff;text-align:center;letter-spacing:.7px}</style></head><body><div class="track"><div class="fill"></div></div><p>Opening your library···</p><script>setTimeout(()=>window.ReactNativeWebView.postMessage('done'),4000)</script></body></html>`;
export function Loader({ onFinish }: { onFinish: () => void }) {
  const { height, width } = useWindowDimensions();
  const logoSize = Math.min(238, width * 0.6, height * 0.3);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(onFinish, 4200);
    return () => clearTimeout(t);
  }, [loaded, onFinish]);
  return (
    <LinearGradient
      colors={backgroundGradient}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <StorySparkles />
      <View style={StyleSheet.absoluteFill}>
        <Text
          style={{
            color: 'white',
            position: 'absolute',
            top: '14%',
            left: '15%',
          }}
        >
          ·
        </Text>
        <Text
          style={{
            color: '#FFE49A',
            position: 'absolute',
            top: '23%',
            right: '18%',
          }}
        >
          ·
        </Text>
      </View>
      <StoryArt
        source={assets.logo}
        style={{
          width: logoSize,
          height: logoSize,
          borderRadius: logoSize / 2,
          borderWidth: 2,
          borderColor: '#FFD166',
        }}
      />
      <Text
        style={[
          s.label,
          {
            letterSpacing: 5,
            marginTop: height < 700 ? 24 : 40,
            color: '#FFE49A',
          },
        ]}
      >
        YOUR NEXT CHAPTER
      </Text>
      <Text
        style={{
          fontFamily: 'Georgia',
          fontSize: width < 360 ? 32 : 40,
          color: colors.text,
          fontWeight: '700',
          marginTop: 10,
        }}
      >
        Bully Tales
      </Text>
      <Text style={[s.body, { marginTop: 8 }]}>Read more. Wonder more.</Text>
      <View
        style={{
          position: 'absolute',
          bottom: height < 700 ? 24 : 65,
          width: 230,
          height: 65,
        }}
      >
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          style={{ backgroundColor: 'transparent' }}
          scrollEnabled={false}
          onLoad={() => setLoaded(true)}
          onMessage={onFinish}
          onError={onFinish}
        />
      </View>
    </LinearGradient>
  );
}
const slides = [
  {
    tag: 'LIBRARY BUILDER',
    title: 'Your library,\nbeautifully organized',
    body: 'Add books, upload covers and sort every story into Reading, Read, Want to Read or Abandoned.',
  },
  {
    tag: 'READING TOOLS',
    title: 'Tools that keep\nyou turning pages',
    body: 'Plan with smart reading calculators, then settle in with a cozy, distraction-free reading timer.',
  },
  {
    tag: 'LEARN & PLAY',
    title: 'Learn, quiz and\nplay with friends',
    body: 'Master literary terms, beat the Match Quiz and host word-guessing games with your crew.',
  },
];
export function Onboarding() {
  const [step, setStep] = useState(0);
  const { update } = useStore();
  const { height, width, fontScale } = useWindowDimensions();
  const compact = height < 730 || width < 375 || fontScale > 1.15;
  const finish = () => update(x => ({ ...x, onboarded: true }));
  return (
    <Screen animationKey={step}>
      <Text style={s.label}>Bully Tales</Text>
      <Pressable
        onPress={finish}
        accessibilityRole="button"
        style={{ alignSelf: 'flex-end', padding: 10 }}
      >
        <Text style={s.body}>Skip</Text>
      </Pressable>
      <StoryArt
        source={assets.onboard[step]}
        resizeMode="contain"
        style={{
          width: '100%',
          height: Math.max(160, Math.min(345, height * (compact ? 0.3 : 0.38))),
          marginVertical: compact ? 10 : 18,
        }}
      />
      <View style={{ gap: compact ? 12 : 17 }}>
        <View style={s.row}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                height: 8,
                width: step === i ? 28 : 8,
                borderRadius: 6,
                backgroundColor: step === i ? colors.pink : colors.border,
              }}
            />
          ))}
        </View>
        <Text style={[s.label, { color: colors.pink }]}>{slides[step].tag}</Text>
        <Text
          style={[
            s.title,
            { fontSize: compact ? 27 : 31, lineHeight: compact ? 32 : 36 },
          ]}
        >
          {slides[step].title}
        </Text>
        <Text
          style={[s.body, { fontSize: 16, lineHeight: 25, marginBottom: 10 }]}
        >
          {slides[step].body}
        </Text>
        <View style={s.row}>
          {step > 0 && (
            <Button title="‹" secondary onPress={() => setStep(step - 1)} />
          )}
          <View style={{ flex: 1 }}>
            <Button
              title={step === 2 ? 'Get Started' : 'Continue'}
              onPress={() => (step === 2 ? finish() : setStep(step + 1))}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}
