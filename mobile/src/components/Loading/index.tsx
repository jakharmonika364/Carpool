import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';

const ORANGE = '#F4693D';
const BACKGROUND = '#0B0B0E';
const SUBTITLE = '#9A9AA2';

function RouteMarkerIcon() {
  return (
    <Svg width={96} height={96} viewBox="0 0 100 100">
      <Path
        d="M50,10 C36,10 25,21 25,35 C25,50 50,70 50,70 C50,70 75,50 75,35 C75,21 64,10 50,10 Z"
        fill="none"
        stroke={ORANGE}
        strokeWidth={4}
      />
      <Circle cx={50} cy={35} r={6} fill={ORANGE} />
      <Path
        d="M50,70 C40,78 30,82 22,88"
        fill="none"
        stroke={ORANGE}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M50,70 C60,78 70,82 78,88"
        fill="none"
        stroke={ORANGE}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Circle cx={22} cy={88} r={4} fill="none" stroke={ORANGE} strokeWidth={3} />
      <Circle cx={78} cy={88} r={4} fill="none" stroke={ORANGE} strokeWidth={3} />
    </Svg>
  );
}

function LoadingDots() {
  const dots = useRef([...Array(3)].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay((2 - index) * 150),
        ]),
      ),
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [dots]);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, index) => (
        <Animated.View key={index} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <RouteMarkerIcon />
      <Text style={styles.title}>Campus Carpool</Text>
      <Text style={styles.subtitle}>Share the ride. Verified and safe.</Text>
      <LoadingDots />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND,
    paddingHorizontal: 32,
  },
  title: {
    marginTop: 24,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: SUBTITLE,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },
});
