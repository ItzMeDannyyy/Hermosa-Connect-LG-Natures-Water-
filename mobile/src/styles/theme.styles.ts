/**
 * ============================================================================
 * FILE: src/styles/theme.styles.ts
 * PURPOSE: Shared color tokens and layout CSS/StyleSheet rules for the
 *          LG Nature's Water Mobile Application.
 * ============================================================================
 */

import { StyleSheet } from 'react-native';

export const COLORS = {
  navyDark: '#061527',
  navyPrimary: '#0a2540',
  navyCard: '#0f3156',
  bluePrimary: '#2563eb',
  skyAccent: '#0284c7',
  skyLight: '#e0f2fe',
  skyBorder: '#bae6fd',
  emeraldPrimary: '#059669',
  emeraldLight: '#d1fae5',
  emeraldBorder: '#a7f3d0',
  amberPrimary: '#d97706',
  amberLight: '#fef3c7',
  amberBorder: '#fde68a',
  redPrimary: '#dc2626',
  redLight: '#fee2e2',
  redBorder: '#fecaca',
  slateBg: '#f1f5f9',
  white: '#ffffff',
  borderLight: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
};

export const sharedStyles = StyleSheet.create({
  safeScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.slateBg,
  },
  demoSwitcherTopBar: {
    backgroundColor: COLORS.navyDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a5f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoBarLeftLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoBarTitleText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  demoRolePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoRolePillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#112a46',
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  demoRolePillButtonActive: {
    backgroundColor: COLORS.bluePrimary,
    borderColor: '#60a5fa',
  },
  demoRolePillText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  demoRolePillTextActive: {
    color: COLORS.white,
  },
  toastNotificationBanner: {
    backgroundColor: COLORS.emeraldPrimary,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
  },
  bottomTabItemActive: {
    backgroundColor: '#eff6ff',
  },
  bottomTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  bottomTabLabelActive: {
    color: COLORS.bluePrimary,
  },
});
