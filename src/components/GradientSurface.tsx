import React from 'react';
import { StyleSheet, View } from 'react-native';
import NativeGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient';

export function GradientSurface({
  children,
  style,
  colors,
  start,
  end,
  locations,
  useAngle,
  angleCenter,
  angle,
  ...viewProps
}: LinearGradientProps) {
  const layout = StyleSheet.flatten(style);
  return (
    <View {...viewProps} style={style}>
      <NativeGradient
        pointerEvents="none"
        colors={colors}
        start={start}
        end={end}
        locations={locations}
        useAngle={useAngle}
        angleCenter={angleCenter}
        angle={angle}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: layout?.borderRadius,
            borderTopLeftRadius: layout?.borderTopLeftRadius,
            borderTopRightRadius: layout?.borderTopRightRadius,
            borderBottomLeftRadius: layout?.borderBottomLeftRadius,
            borderBottomRightRadius: layout?.borderBottomRightRadius,
          },
        ]}
      />
      {children}
    </View>
  );
}
