import React from 'react';
import Svg, { Rect, Circle, Line, Path } from 'react-native-svg';
import { colors } from '../../theme/colors';

export function VerifiedIllustration() {
  return (
    <Svg width={112} height={112} viewBox="0 0 100 100">
      <Rect x={15} y={25} width={70} height={50} rx={8} stroke={colors.orange} strokeWidth={3} fill="none" />
      <Circle cx={35} cy={50} r={10} stroke={colors.orange} strokeWidth={3} fill="none" />
      <Line x1={52} y1={42} x2={76} y2={42} stroke={colors.orange} strokeWidth={3} strokeLinecap="round" />
      <Line x1={52} y1={54} x2={68} y2={54} stroke={colors.orange} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={78} cy={72} r={15} fill={colors.background} stroke={colors.orange} strokeWidth={3} />
      <Path
        d="M72,72 L76,76 L85,66"
        fill="none"
        stroke={colors.orange}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
