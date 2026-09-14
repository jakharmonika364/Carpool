import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;

type Role = 'drive' | 'ride';

function MiniRouteIcon() {
  return (
    <Svg width={40} height={36} viewBox="0 0 40 36">
      <Path
        d="M12,10 C20,16 20,20 28,26"
        fill="none"
        stroke={colors.orange}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={10} r={5} fill="none" stroke={colors.orange} strokeWidth={2} />
      <Circle cx={12} cy={10} r={1.5} fill={colors.orange} />
      <Circle cx={28} cy={26} r={5} fill="none" stroke={colors.orange} strokeWidth={2} />
      <Circle cx={28} cy={26} r={1.5} fill={colors.orange} />
    </Svg>
  );
}

function ProfileAvatarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} fill="none" stroke={colors.orange} strokeWidth={2} />
      <Path
        d="M4,21 C4,16.5 7.5,14 12,14 C16.5,14 20,16.5 20,21"
        fill="none"
        stroke={colors.orange}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CarIcon() {
  return (
    <Svg width={26} height={22} viewBox="0 0 26 22">
      <Path
        d="M4,14 L5.5,7.5 C6,5.8 7.5,4.5 9.5,4.5 L16.5,4.5 C18.5,4.5 20,5.8 20.5,7.5 L22,14"
        fill="none"
        stroke={colors.textPrimary}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M2.5,14 L23.5,14 C24,14 24.5,14.5 24.5,15 L24.5,17 C24.5,17.5 24,18 23.5,18 L2.5,18 C2,18 1.5,17.5 1.5,17 L1.5,15 C1.5,14.5 2,14 2.5,14 Z"
        fill="none"
        stroke={colors.textPrimary}
        strokeWidth={1.8}
      />
      <Circle cx={6.5} cy={18} r={2} fill={colors.background} stroke={colors.textPrimary} strokeWidth={1.8} />
      <Circle cx={19.5} cy={18} r={2} fill={colors.background} stroke={colors.textPrimary} strokeWidth={1.8} />
    </Svg>
  );
}

function PinIcon() {
  return (
    <Svg width={20} height={24} viewBox="0 0 20 24">
      <Path
        d="M10,2 C5.6,2 2,5.4 2,9.6 C2,15 10,22 10,22 C10,22 18,15 18,9.6 C18,5.4 14.4,2 10,2 Z"
        fill="none"
        stroke={colors.textPrimary}
        strokeWidth={1.8}
      />
      <Circle cx={10} cy={9.6} r={2.6} fill="none" stroke={colors.textPrimary} strokeWidth={1.8} />
    </Svg>
  );
}

function RadioIndicator({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <View style={styles.radioSelected}>
        <Text style={styles.radioCheck}>✓</Text>
      </View>
    );
  }
  return <View style={styles.radioUnselected} />;
}

export function RoleSelectionScreen({ navigation }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role>('drive');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>PROFILE SETUP</Text>
        <View style={styles.avatarCircle}>
          <ProfileAvatarIcon />
        </View>
      </View>

      <View style={styles.content}>
        <MiniRouteIcon />
        <Text style={styles.title}>How will you use the app?</Text>
        <Text style={styles.subtitle}>You can switch anytime from your profile.</Text>

        <Pressable
          style={[styles.card, selectedRole === 'drive' && styles.cardSelected]}
          onPress={() => setSelectedRole('drive')}
        >
          <View style={styles.cardHeaderRow}>
            <CarIcon />
            <RadioIndicator selected={selectedRole === 'drive'} />
          </View>
          <Text style={styles.cardTitle}>Drive</Text>
          <Text style={styles.cardSubtitle}>Share your daily commute and split the fare</Text>
        </Pressable>

        <Pressable
          style={[styles.card, selectedRole === 'ride' && styles.cardSelected]}
          onPress={() => setSelectedRole('ride')}
        >
          <View style={styles.cardHeaderRow}>
            <PinIcon />
            <RadioIndicator selected={selectedRole === 'ride'} />
          </View>
          <Text style={styles.cardTitle}>Ride</Text>
          <Text style={styles.cardSubtitle}>Match with verified drivers along your route</Text>
        </Pressable>
      </View>

      <Pressable style={styles.continueButton}>
        <Text style={styles.continueLabel}>CONTINUE</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244,105,61,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.chipOff,
    backgroundColor: colors.chipOff,
    padding: 18,
  },
  cardSelected: {
    borderColor: colors.orange,
    backgroundColor: 'rgba(244,105,61,0.08)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCheck: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.chipOffLabel,
  },
  continueButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
