/**
 * ============================================================================
 * FILE: src/styles/theme.styles.ts
 * PURPOSE: Refined color tokens and shared layout StyleSheet rules for the
 *          LG Nature's Water Mobile Application.
 *          Adheres to tasteskill v2 / design-taste-frontend anti-slop rules:
 *          - Honest contrast without muddy gradients
 *          - Color reserved for data state (crimson for unpaid, emerald for receipt)
 *          - 1px hairline structural boundaries
 * ============================================================================
 */

import { StyleSheet } from 'react-native';

export const COLORS = {
  // Brand Mineral Waters
  navyDark: '#081424',
  navyPrimary: '#0f2238',
  navyCard: '#132c4a',
  bluePrimary: '#0284c7', // Pure Glacial Cyan / Blue
  skyAccent: '#0ea5e9',
  skyLight: '#f0f9ff',
  skyBorder: '#bae6fd',

  // Semantics: Data State Only
  emeraldPrimary: '#059669',
  emeraldLight: '#ecfdf5',
  emeraldBorder: '#a7f3d0',
  amberPrimary: '#d97706',
  amberLight: '#fffbeb',
  amberBorder: '#fde68a',
  redPrimary: '#dc2626',
  redLight: '#fef2f2',
  redBorder: '#fecaca',

  // Surfaces & Hairlines
  slateBg: '#f8fafc',
  white: '#ffffff',
  cardSubtle: '#f1f5f9',
  borderLight: '#e2e8f0',
  borderDark: '#1e3a5f',

  // Typography
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
};

export const sharedStyles = StyleSheet.create({
  safeScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.slateBg,
  },
  demoSwitcherTopBar: {
    backgroundColor: COLORS.navyDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#172e48',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  demoBarLeftLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  demoBarTitleText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  demoRolePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentedControlTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f243d',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1e3e64',
  },
  segmentedPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 7,
  },
  segmentedPillButtonActive: {
    backgroundColor: COLORS.bluePrimary,
  },
  segmentedPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  segmentedPillTextActive: {
    color: COLORS.white,
    fontWeight: '800',
  },
  signOutIconButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastNotificationBanner: {
    backgroundColor: '#047857',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toastNotificationText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  bottomTabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    gap: 2,
  },
  bottomTabItemActive: {
    backgroundColor: '#f0f9ff',
  },
  bottomTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  bottomTabLabelActive: {
    color: COLORS.bluePrimary,
    fontWeight: '800',
  },
});
