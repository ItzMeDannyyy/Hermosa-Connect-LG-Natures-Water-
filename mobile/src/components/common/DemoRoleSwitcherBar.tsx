/**
 * ============================================================================
 * FILE: src/components/common/DemoRoleSwitcherBar.tsx
 * PURPOSE: Top Mobile Role Switcher Bar allowing instant switching between
 *          Customer and Rider mobile views, plus Sign Out.
 *          Operator role removed per design architecture (Web POS only).
 *          Uses Lucide icons (lucide-react-native) strictly.
 * ============================================================================
 */

import { Droplets, LogOut, Truck, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { sharedStyles } from '../../styles/theme.styles';
import type { MobileUserRole } from '../../types/mobile.types';

interface DemoRoleSwitcherBarProps {
  activeRole: MobileUserRole;
  isAuthenticated: boolean;
  onSelectRole: (role: MobileUserRole) => void;
  onSignOut: () => void;
}

export function DemoRoleSwitcherBar(props: DemoRoleSwitcherBarProps) {
  const isCustomerActive = props.activeRole === 'CUSTOMER';
  const isRiderActive = props.activeRole === 'RIDER';

  return (
    <View style={sharedStyles.demoSwitcherTopBar}>
      <View style={sharedStyles.demoBarLeftLabelRow}>
        <Droplets size={14} color="#38bdf8" />
        <Text style={sharedStyles.demoBarTitleText}>LG NATURE&apos;S WATER</Text>
      </View>

      <View style={sharedStyles.demoRolePillsRow}>
        {/* Segmented Control: Customer | Rider */}
        <View style={sharedStyles.segmentedControlTrack}>
          <Pressable
            onPress={() => {
              props.onSelectRole('CUSTOMER');
            }}
            style={[
              sharedStyles.segmentedPillButton,
              isCustomerActive ? sharedStyles.segmentedPillButtonActive : null,
            ]}
          >
            <User
              size={12}
              color={isCustomerActive ? '#ffffff' : '#94a3b8'}
            />
            <Text
              style={[
                sharedStyles.segmentedPillText,
                isCustomerActive ? sharedStyles.segmentedPillTextActive : null,
              ]}
            >
              Customer
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              props.onSelectRole('RIDER');
            }}
            style={[
              sharedStyles.segmentedPillButton,
              isRiderActive ? sharedStyles.segmentedPillButtonActive : null,
            ]}
          >
            <Truck
              size={12}
              color={isRiderActive ? '#ffffff' : '#94a3b8'}
            />
            <Text
              style={[
                sharedStyles.segmentedPillText,
                isRiderActive ? sharedStyles.segmentedPillTextActive : null,
              ]}
            >
              Rider
            </Text>
          </Pressable>
        </View>

        {/* Sign Out Action (only shown when authenticated) */}
        {props.isAuthenticated && (
          <Pressable
            onPress={props.onSignOut}
            accessibilityLabel="Sign Out"
            style={sharedStyles.signOutIconButton}
          >
            <LogOut size={13} color="#f87171" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
