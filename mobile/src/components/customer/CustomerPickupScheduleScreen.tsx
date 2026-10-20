/**
 * ============================================================================
 * FILE: src/components/customer/CustomerPickupScheduleScreen.tsx
 * PURPOSE: Implements Wireframe C2 (Schedule & Container Pickup — Feature 02).
 *          - 1. Select Pickup Day (MON 12, TUE 13, WED 14, THU 15)
 *          - 2. Select Time Window (8-10 AM, 1-3 PM, 4-6 PM)
 *          - 3. Empty Containers Ready for Pickup (+/- stepper)
 *          - Day-Before Auto-Reminder Notice + Confirm Button
 *          - Uses Lucide icons (lucide-react-native) strictly.
 * ============================================================================
 */

import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Minus,
  Plus,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  PICKUP_DAY_OPTIONS,
  PICKUP_TIME_SLOT_OPTIONS,
} from '../../data/mobileInitialData';
import { customerStyles } from '../../styles/customer.styles';
import type {
  PickupScheduleFormState,
  TimeSlotOption,
} from '../../types/mobile.types';

interface CustomerPickupScheduleScreenProps {
  emptyContainersOut: number;
  scheduleForm: PickupScheduleFormState;
  onSelectDay: (dayCode: string, dayFullLabel: string) => void;
  onSelectTimeSlot: (slot: TimeSlotOption) => void;
  onAdjustContainerCount: (delta: number) => void;
  onConfirmSchedule: () => void;
  onBackToHome: () => void;
}

export function CustomerPickupScheduleScreen(
  props: CustomerPickupScheduleScreenProps,
) {
  return (
    <ScrollView contentContainerStyle={customerStyles.scrollBody}>
      {/* Top Back Bar */}
      <Pressable
        onPress={props.onBackToHome}
        style={customerStyles.secondaryActionCard}
      >
        <View style={customerStyles.secondaryActionLeft}>
          <ArrowLeft size={18} color="#0f172a" />
          <View>
            <Text style={customerStyles.secondaryActionTitle}>
              Schedule an Empty Container Pickup
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              Customer-set pickup slot &amp; automatic day-before reminder
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 1. Select Pickup Day */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>1. SELECT PICKUP DAY</Text>
        <View style={customerStyles.dayCardsRow}>
          {PICKUP_DAY_OPTIONS.map((dayItem) => {
            const isSelected =
              props.scheduleForm.selectedDayCode === dayItem.code;
            return (
              <Pressable
                key={dayItem.code}
                onPress={() => {
                  props.onSelectDay(dayItem.code, dayItem.fullLabel);
                }}
                style={[
                  customerStyles.dayOptionCard,
                  isSelected ? customerStyles.dayOptionCardActive : null,
                ]}
              >
                <Calendar
                  size={14}
                  color={isSelected ? '#2563eb' : '#64748b'}
                />
                <Text
                  style={[
                    customerStyles.dayShortText,
                    isSelected ? customerStyles.dayShortTextActive : null,
                  ]}
                >
                  {dayItem.shortDay}
                </Text>
                <Text
                  style={[
                    customerStyles.dayNumberText,
                    isSelected ? customerStyles.dayNumberTextActive : null,
                  ]}
                >
                  {dayItem.dateNum}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2. Select Time Window */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>2. SELECT TIME WINDOW</Text>
        <View>
          {PICKUP_TIME_SLOT_OPTIONS.map((slot) => {
            const isSelected = props.scheduleForm.selectedTimeSlot === slot;
            return (
              <Pressable
                key={slot}
                onPress={() => {
                  props.onSelectTimeSlot(slot);
                }}
                style={[
                  customerStyles.slotRadioRow,
                  isSelected ? customerStyles.slotRadioRowActive : null,
                ]}
              >
                <View style={customerStyles.slotRadioLeft}>
                  <Clock size={16} color={isSelected ? '#2563eb' : '#64748b'} />
                  <Text style={customerStyles.slotRadioLabel}>{slot}</Text>
                </View>

                {isSelected && (
                  <View style={customerStyles.presetTagPill}>
                    <Text style={customerStyles.presetTagText}>Selected</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 3. Empty Containers Ready for Pickup */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>
          3. EMPTY CONTAINERS READY FOR PICKUP
        </Text>
        <Text style={customerStyles.secondaryActionSub}>
          You currently have {props.emptyContainersOut} empty containers held at
          your address.
        </Text>

        <View style={customerStyles.stepperContainer}>
          <Pressable
            onPress={() => {
              props.onAdjustContainerCount(-1);
            }}
            style={customerStyles.stepperButton}
          >
            <Minus size={18} color="#0f172a" />
          </Pressable>

          <Text style={customerStyles.stepperCountValue}>
            {props.scheduleForm.containersToReturn}
          </Text>

          <Pressable
            onPress={() => {
              props.onAdjustContainerCount(1);
            }}
            style={customerStyles.stepperButton}
          >
            <Plus size={18} color="#0f172a" />
          </Pressable>
        </View>
      </View>

      {/* 4. Day-Before Auto-Reminder Notice */}
      <View style={customerStyles.reminderNoticeBox}>
        <Bell size={18} color="#d97706" />
        <Text style={customerStyles.reminderNoticeText}>
          Auto-Reminder: We will notify you &amp; Station 1 the day before your{' '}
          {props.scheduleForm.selectedDayLabel} (
          {props.scheduleForm.selectedTimeSlot}) pickup.
        </Text>
      </View>

      {/* 5. Confirm Pickup Schedule CTA */}
      <Pressable
        onPress={props.onConfirmSchedule}
        style={customerStyles.oneClickOrderButton}
      >
        <CheckCircle2 size={18} color="#ffffff" />
        <Text style={customerStyles.oneClickOrderButtonText}>
          CONFIRM PICKUP SCHEDULE
        </Text>
      </Pressable>
    </ScrollView>
  );
}
