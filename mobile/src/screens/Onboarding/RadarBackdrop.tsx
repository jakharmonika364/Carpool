import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface RadarBackdropProps {
  size?: number;
}

export function RadarBackdrop({ size = 240 }: RadarBackdropProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Circle
        cx={120}
        cy={120}
        r={110}
        stroke={colors.radarLine}
        strokeWidth={1}
        strokeDasharray="4 6"
        fill="none"
      />
      <Circle
        cx={120}
        cy={120}
        r={72}
        stroke={colors.radarLine}
        strokeWidth={1}
        strokeDasharray="4 6"
        fill="none"
      />
      <Line x1={6} y1={120} x2={234} y2={120} stroke={colors.radarLine} strokeWidth={1} />
      <Line x1={120} y1={6} x2={120} y2={234} stroke={colors.radarLine} strokeWidth={1} />
    </Svg>
  );
}
