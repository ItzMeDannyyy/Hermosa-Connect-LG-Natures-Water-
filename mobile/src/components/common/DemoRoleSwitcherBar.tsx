/**
 * ============================================================================
 * FILE: src/components/common/DemoRoleSwitcherBar.tsx
 * PURPOSE: Top Ideathon 1-Tap Role Switcher Bar (Wireframe M0) allowing instant
 *          switching between Customer, Rider, and Operator views, plus Sign Out.
 *          Uses Lucide icons (lucide-react-native) strictly.
 * ============================================================================
 */

import { Home, LogOut, Store, Terminal, Truck } from 'lucide-react-native';
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
  const isOperatorActive = props.activeRole === 'OPERATOR';

  return (
    <View style={sharedStyles.demoSwitcherTopBar}>
      <View style={sharedStyles.demoBarLeftLabelRow}>
        <Terminal size={13} color="#93c5fd" />
        <Text style={sharedStyles.demoBarTitleText}>Demo Switcher</Text>
      </View>

      <View style={sharedStyles.demoRolePillsRow}>
        {/* 1. Customer Role Pill */}
        <Pressable
          onPress={() => {
            props.onSelectRole('CUSTOMER');
          }}
          style={[
            sharedStyles.demoRolePillButton,
            isCustomerActive ? sharedStyles.demoRolePillButtonActive : null,
          ]}
        >
          <Home size={12} color={isCustomerActive ? '#ffffff' : '#cbd5e1'} />
          <Text
            style={[
              sharedStyles.demoRolePillText,
              isCustomerActive ? sharedStyles.demoRolePillTextActive : null,
            ]}
          >
            Customer
          </Text>
        </Pressable>

        {/* 2. Rider Role Pill */}
        <Pressable
          onPress={() => {
            props.onSelectRole('RIDER');
          }}
          style={[
            sharedStyles.demoRolePillButton,
            isRiderActive ? sharedStyles.demoRolePillButtonActive : null,
          ]}
        >
          <Truck size={12} color={isRiderActive ? '#ffffff' : '#cbd5e1'} />
          <Text
            style={[
              sharedStyles.demoRolePillText,
              isRiderActive ? sharedStyles.demoRolePillTextActive : null,
            ]}
          >
            Rider
          </Text>
        </Pressable>

        {/* 3. Operator Role Pill */}
        <Pressable
          onPress={() => {
            props.onSelectRole('OPERATOR');
          }}
          style={[
            sharedStyles.demoRolePillButton,
            isOperatorActive ? sharedStyles.demoRolePillButtonActive : null,
          ]}
        >
          <Store size={12} color={isOperatorActive ? '#ffffff' : '#cbd5e1'} />
          <Text
            style={[
              sharedStyles.demoRolePillText,
              isOperatorActive ? sharedStyles.demoRolePillTextActive : null,
            ]}
          >
            Operator
          </Text>
        </Pressable>

        {/* Sign Out Pill (only shown when logged in) */}
        {props.isAuthenticated && (
          <Pressable
            onPress={props.onSignOut}
            style={sharedStyles.demoRolePillButton}
          >
            <LogOut size={12} color="#fca5a5" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
