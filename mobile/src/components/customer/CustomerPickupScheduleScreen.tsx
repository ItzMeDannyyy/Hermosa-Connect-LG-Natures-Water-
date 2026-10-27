/**
 * ============================================================================
 * FILE: src/components/customer/CustomerPickupScheduleScreen.tsx
 * PURPOSE: Schedule Empty Container Pickup.
 *          Allows customers to pick date chips, time windows, and set empty
 *          container quantities to return to Station 1.
 *          Strict Lucide icons (lucide-react-native).
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
      {/* Top Back Navigation Bar */}
      <Pressable
        onPress={props.onBackToHome}
        style={customerStyles.secondaryActionCard}
      >
        <View style={customerStyles.secondaryActionLeft}>
          <ArrowLeft size={18} color="#0f172a" />
          <View>
            <Text style={customerStyles.secondaryActionTitle}>
              Schedule Empty Jug Pickup
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              Select your pickup day &amp; preferred delivery window
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 1. Select Pickup Day */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>Select Pickup Day</Text>
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
                  color={isSelected ? '#0284c7' : '#64748b'}
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
        <Text style={customerStyles.sectionLabel}>Preferred Time Window</Text>
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
                  <Clock size={16} color={isSelected ? '#0284c7' : '#64748b'} />
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
          Containers Ready for Pickup
        </Text>
        <Text style={customerStyles.secondaryActionSub}>
          You currently hold {props.emptyContainersOut} empty containers at your address.
        </Text>

        <View style={customerStyles.stepperContainer}>
          <Pressable
            onPress={() => {
              props.onAdjustContainerCount(-1);
            }}
            disabled={props.scheduleForm.containersToReturn <= 0}
            style={[
              customerStyles.stepperButton,
              props.scheduleForm.containersToReturn <= 0 ? { opacity: 0.4 } : null,
            ]}
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

      {/* 4. Automated SMS Reminder Notice */}
      <View style={customerStyles.reminderNoticeBox}>
        <Bell size={18} color="#b45309" />
        <Text style={customerStyles.reminderNoticeText}>
          Automated Notice: Station 1 will dispatch rider J. Cruz for your{' '}
          {props.scheduleForm.selectedDayLabel} ({props.scheduleForm.selectedTimeSlot}) return.
        </Text>
      </View>

      {/* 5. Confirm Pickup Schedule CTA */}
      <Pressable
        onPress={props.onConfirmSchedule}
        style={customerStyles.oneClickOrderButton}
      >
        <CheckCircle2 size={16} color="#ffffff" />
        <Text style={customerStyles.oneClickOrderButtonText}>
          CONFIRM PICKUP SCHEDULE
        </Text>
      </Pressable>
    </ScrollView>
  );
}
