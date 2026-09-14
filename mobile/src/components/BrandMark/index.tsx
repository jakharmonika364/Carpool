import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 96 }: BrandMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50,10 C36,10 25,21 25,35 C25,50 50,70 50,70 C50,70 75,50 75,35 C75,21 64,10 50,10 Z"
        fill="none"
        stroke={colors.orange}
        strokeWidth={4}
      />
      <Circle cx={50} cy={35} r={6} fill={colors.orange} />
      <Path
        d="M50,70 C40,78 30,82 22,88"
        fill="none"
        stroke={colors.orange}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M50,70 C60,78 70,82 78,88"
        fill="none"
        stroke={colors.orange}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Circle cx={22} cy={88} r={4} fill="none" stroke={colors.orange} strokeWidth={3} />
      <Circle cx={78} cy={88} r={4} fill="none" stroke={colors.orange} strokeWidth={3} />
    </Svg>
  );
}
