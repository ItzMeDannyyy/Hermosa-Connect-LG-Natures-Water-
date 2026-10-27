/**
 * ============================================================================
 * FILE: src/styles/card.styles.ts
 * PURPOSE: Shared card, panel, and billing breakdown styles for Rider screens.
 * ============================================================================
 */

import { StyleSheet } from 'react-native';
import { COLORS } from './theme.styles';

export const cardStyles = StyleSheet.create({
  whitePanelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  billRowLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  billRowValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  billTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  billTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0284c7',
  },
  secondaryActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  secondaryActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  secondaryActionSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
});
