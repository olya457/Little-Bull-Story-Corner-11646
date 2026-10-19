import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
export function AmbientAudio({
  sound,
  playing,
}: {
  sound: string;
  playing: boolean;
}) {
  if (sound === 'None' || !playing) return null;
  const html = `<html><body><script>const C=window.AudioContext||window.webkitAudioContext;const c=new C();const b=c.createBuffer(1,c.sampleRate*4,c.sampleRate);const d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const white=Math.random()*2-1;last=(last+.02*white)/1.02;d[i]=${
    sound === 'Rain' ? 'white*.15' : 'last*3.5'
  };}const src=c.createBufferSource();src.buffer=b;src.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=${
    sound === 'Rain'
      ? 2500
      : sound === 'Fireplace'
      ? 550
      : sound === 'Café'
      ? 900
      : 350
  };const g=c.createGain();g.gain.value=.45;src.connect(f);f.connect(g);g.connect(c.destination);src.start();${
    sound === 'Waves'
      ? 'const osc=c.createOscillator();osc.frequency.value=.12;const mod=c.createGain();mod.gain.value=.3;osc.connect(mod);mod.connect(g.gain);osc.start();'
      : ''
  }c.resume();</script></body></html>`;
  return (
    <View
      style={{ width: 1, height: 1, position: 'absolute', opacity: 0.01 }}
      pointerEvents="none"
    >
      <WebView
        source={{ html }}
        originWhitelist={['*']}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
      />
    </View>
  );
}
