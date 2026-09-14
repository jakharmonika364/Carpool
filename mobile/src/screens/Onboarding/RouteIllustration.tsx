import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { RadarBackdrop } from './RadarBackdrop';

const PIN_PATH = 'M50,10 C36,10 25,21 25,35 C25,50 50,70 50,70 C50,70 75,50 75,35 C75,21 64,10 50,10 Z';

function Pin({ cx, cy }: { cx: number; cy: number }) {
  return (
    <G transform={`translate(${cx - 18},${cy - 22}) scale(0.36)`}>
      <Path d={PIN_PATH} fill="none" stroke={colors.orange} strokeWidth={4} />
      <Circle cx={50} cy={35} r={6} fill={colors.orange} />
    </G>
  );
}

export function RouteIllustration() {
  return (
    <View style={styles.container}>
      <RadarBackdrop size={240} />
      <View style={StyleSheet.absoluteFill}>
        <Svg width={240} height={240} viewBox="0 0 240 240">
          <Path
            d="M42,196 C56,172 64,160 84,150"
            stroke={colors.orange}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={42} cy={196} r={4} fill={colors.orange} />
          <Path
            d="M156,150 C176,160 184,172 198,196"
            stroke={colors.orange}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={198} cy={196} r={4} fill={colors.orange} />
          <Path
            d="M90,110 C108,82 132,82 150,110"
            stroke={colors.orange}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <Pin cx={84} cy={104} />
          <Pin cx={156} cy={104} />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
