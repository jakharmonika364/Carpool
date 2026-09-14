import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { RadarBackdrop } from './RadarBackdrop';

type DayState = 'active' | 'today' | 'off';

const DAYS: Array<{ label: string; state: DayState }> = [
  { label: 'M', state: 'active' },
  { label: 'T', state: 'active' },
  { label: 'W', state: 'today' },
  { label: 'T', state: 'active' },
  { label: 'F', state: 'active' },
  { label: 'S', state: 'off' },
  { label: 'S', state: 'active' },
];

function DayChip({ label, state }: { label: string; state: DayState }) {
  if (state === 'today') {
    return (
      <View style={styles.chipColumn}>
        <View style={[styles.chip, styles.chipToday]}>
          <Text style={[styles.chipLabel, styles.chipTodayLabel]}>{label}</Text>
          <View style={styles.todayDot} />
        </View>
        <Text style={styles.todayCaption}>TODAY</Text>
      </View>
    );
  }

  if (state === 'off') {
    return (
      <View style={styles.chipColumn}>
        <View style={[styles.chip, styles.chipOff]}>
          <Text style={[styles.chipLabel, styles.chipOffLabel]}>{label}</Text>
          <View style={styles.offSlash} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chipColumn}>
      <View style={[styles.chip, styles.chipActive]}>
        <Text style={styles.chipLabel}>{label}</Text>
        <View style={styles.activeDot} />
      </View>
    </View>
  );
}

export function ScheduleIllustration() {
  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <RadarBackdrop size={220} />
      </View>
      <View style={styles.row}>
        {DAYS.map((day, index) => (
          <DayChip key={index} label={day.label} state={day.state} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  chipColumn: {
    alignItems: 'center',
  },
  chip: {
    width: 30,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.orange,
  },
  chipToday: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  chipOff: {
    backgroundColor: colors.chipOff,
  },
  chipLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTodayLabel: {
    color: colors.textPrimary,
  },
  chipOffLabel: {
    color: colors.chipOffLabel,
  },
  activeDot: {
    marginTop: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.textPrimary,
  },
  todayDot: {
    marginTop: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.orange,
  },
  offSlash: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    backgroundColor: colors.chipOffLabel,
    transform: [{ rotate: '45deg' }],
  },
  todayCaption: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.orange,
  },
});
