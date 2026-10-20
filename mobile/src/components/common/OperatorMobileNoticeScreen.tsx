/**
 * ============================================================================
 * FILE: src/components/common/OperatorMobileNoticeScreen.tsx
 * PURPOSE: Displayed when the user selects the OPERATOR role on the Mobile App
 *          Demo Switcher Bar. Explains that Operator True Net Profit & Counter
 *          POS run on the Station Counter Web POS, and offers quick buttons
 *          to switch to Customer or Rider mobile flows.
 *          Uses Lucide icons (lucide-react-native) strictly.
 * ============================================================================
 */

import { Home, Monitor, ShieldAlert, Store, Truck } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { customerStyles } from '../../styles/customer.styles';
import { riderStyles } from '../../styles/rider.styles';
import type { MobileUserRole } from '../../types/mobile.types';

interface OperatorMobileNoticeScreenProps {
  operatorName: string;
  branchName: string;
  onSwitchRole: (role: MobileUserRole) => void;
}

export function OperatorMobileNoticeScreen(
  props: OperatorMobileNoticeScreenProps,
) {
  return (
    <ScrollView contentContainerStyle={customerStyles.scrollBody}>
      <View style={customerStyles.headerCard}>
        <View style={customerStyles.greetingRow}>
          <Store size={20} color="#38bdf8" />
          <Text style={customerStyles.greetingText}>{props.operatorName}</Text>
        </View>
        <Text style={customerStyles.locationText}>
          Branch: {props.branchName} • Station Operator Role Active
        </Text>
      </View>

      <View style={customerStyles.whitePanelCard}>
        <View style={customerStyles.usualOrderTitleRow}>
          <ShieldAlert size={18} color="#2563eb" />
          <Text style={customerStyles.usualOrderTitle}>
            Station Counter Web POS Role
          </Text>
        </View>

        <Text style={customerStyles.billRowLabel}>
          In LG Nature&apos;s Water, the Mobile Application is built for
          Household/Office Customers (C1–C3) and Delivery Riders (R1–R3).
        </Text>

        <View style={customerStyles.reminderNoticeBox}>
          <Monitor size={18} color="#d97706" />
          <Text style={customerStyles.reminderNoticeText}>
            Station Operators manage the Counter POS Register, Cost Deduction
            Engine, Customer Accountability Ledger, and 1-Tap End-of-Day Report
            on the Web POS Dashboard.
          </Text>
        </View>

        <View style={riderStyles.stopActionsRow}>
          <Pressable
            onPress={() => {
              props.onSwitchRole('CUSTOMER');
            }}
            style={riderStyles.stopSecondaryButton}
          >
            <Home size={15} color="#2563eb" />
            <Text style={riderStyles.stopSecondaryButtonText}>
              Open Customer View
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              props.onSwitchRole('RIDER');
            }}
            style={riderStyles.stopPrimaryButton}
          >
            <Truck size={15} color="#ffffff" />
            <Text style={riderStyles.stopPrimaryButtonText}>
              Open Rider View
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
