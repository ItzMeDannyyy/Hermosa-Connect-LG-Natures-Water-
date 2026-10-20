/**
 * ============================================================================
 * FILE: src/components/auth/MobileLoginScreen.tsx
 * PURPOSE: Implements Wireframe M0 (Shared Mobile Login & 2-Step Customer
 *          Delivery Profile Setup).
 *          - Uses modular StyleSheet rules from src/styles/auth.styles.ts
 *          - Uses Lucide icons (lucide-react-native) strictly.
 * ============================================================================
 */

import {
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  MapPin,
  Phone,
  UserPlus,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { authStyles } from '../../styles/auth.styles';
import type { MobileUserRole } from '../../types/mobile.types';

interface MobileLoginScreenProps {
  selectedRole: MobileUserRole;
  isSubmitting: boolean;
  onLoginSubmit: (phoneNumber: string, password: string) => void;
  onCompleteCustomerSetup: (
    fullName: string,
    address: string,
    defaultGallons: number,
  ) => void;
}

export function MobileLoginScreen(props: MobileLoginScreenProps) {
  // Login Form State
  const [phoneNumber, setPhoneNumber] = useState<string>('+639170000003');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // 2-Step Customer Delivery Profile Setup State
  const [isStepTwoOpen, setIsStepTwoOpen] = useState<boolean>(false);
  const [newCustomerName, setNewCustomerName] = useState<string>('Maria Santos');
  const [pinnedAddress, setPinnedAddress] = useState<string>(
    'Blk 4 Lot 12 Pansol St, Quezon City',
  );
  const [defaultGallonsCount, setDefaultGallonsCount] = useState<string>('8');

  function handleTogglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  function handlePressLoginButton() {
    props.onLoginSubmit(phoneNumber, password);
  }

  function handlePressFinishProfileSetup() {
    const parsedGallons = Number(defaultGallonsCount);
    let safeGallons = 8;
    if (!Number.isNaN(parsedGallons) && parsedGallons > 0) {
      safeGallons = parsedGallons;
    }

    props.onCompleteCustomerSetup(newCustomerName, pinnedAddress, safeGallons);
  }

  return (
    <ScrollView contentContainerStyle={authStyles.scrollContainer}>
      <View style={authStyles.contentMaxWrapper}>
        {/* 1. Brand Header Lockup with Logo Placeholder & Colored Cursive Name */}
        <View style={authStyles.brandHeaderBlock}>
          <View style={authStyles.brandTopLockup}>
            <View style={authStyles.logoPlaceholderBox}>
              <Droplets size={22} color="#38bdf8" />
              <Text style={authStyles.logoPlaceholderLabel}>LOGO</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={authStyles.brandColoredTitleRow}>
                <Text style={authStyles.brandTextLg}>LG </Text>
                <Text style={authStyles.brandTextNatures}>Nature&apos;s </Text>
                <Text style={authStyles.brandTextWater}>Water</Text>
              </View>
              <Text style={authStyles.brandTaglineSubtitle}>
                One Tap Water Delivery &amp; Smart Station POS
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Outer Glass Ring + White Sign In Card */}
        <View style={authStyles.loginOuterRing}>
          <View style={authStyles.loginWhiteCard}>
            <View style={authStyles.cardTopHeaderRow}>
              <View style={authStyles.cardIconBadge}>
                <Droplets size={20} color="#2563eb" />
              </View>

              <View style={authStyles.onlineStatusPill}>
                <View style={authStyles.onlineDot} />
                <Text style={authStyles.onlineStatusText}>
                  Station 1 Online
                </Text>
              </View>
            </View>

            <Text style={authStyles.cardHeading}>Mobile Sign In</Text>
            <Text style={authStyles.cardSubtitle}>
              Sign in with your mobile number or use the top Demo Switcher bar.
            </Text>

            {/* Phone Number Field */}
            <View style={authStyles.fieldBlock}>
              <Text style={authStyles.fieldLabel}>Phone Number</Text>
              <View style={authStyles.inputRowBox}>
                <Phone size={16} color="#64748b" />
                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                  }}
                  placeholder="+639170000003"
                  placeholderTextColor="#94a3b8"
                  style={authStyles.textInputField}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={authStyles.fieldBlock}>
              <Text style={authStyles.fieldLabel}>Password</Text>
              <View style={authStyles.inputRowBox}>
                <Lock size={16} color="#64748b" />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  style={authStyles.textInputField}
                />
                <Pressable onPress={handleTogglePasswordVisibility}>
                  {showPassword ? (
                    <EyeOff size={17} color="#64748b" />
                  ) : (
                    <Eye size={17} color="#64748b" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Primary Login Button */}
            <Pressable
              onPress={handlePressLoginButton}
              disabled={props.isSubmitting}
              style={authStyles.primaryLoginButton}
            >
              <LogIn size={17} color="#ffffff" />
              <Text style={authStyles.primaryLoginButtonText}>
                {props.isSubmitting ? 'Signing In...' : 'LOG IN (ONE TAP)'}
              </Text>
            </Pressable>

            {/* 2-Step Customer Onboarding Section (Wireframe M0) */}
            <View style={authStyles.signupDividerBlock}>
              <Text style={authStyles.signupPromptText}>
                New Household or Office Customer?
              </Text>

              <Pressable
                onPress={() => {
                  setIsStepTwoOpen(!isStepTwoOpen);
                }}
                style={authStyles.secondaryOutlineButton}
              >
                <UserPlus size={15} color="#2563eb" />
                <Text style={authStyles.secondaryOutlineButtonText}>
                  Set Up 1-Click Delivery Profile
                </Text>
              </Pressable>

              {isStepTwoOpen && (
                <View style={authStyles.stepTwoProfileBox}>
                  <Text style={authStyles.stepTwoTitle}>
                    Step 2: Pin GPS on Map &amp; Set Default Gallons
                  </Text>

                  <View style={authStyles.gpsPinPreviewCard}>
                    <MapPin size={16} color="#0284c7" />
                    <Text style={authStyles.gpsPinText}>
                      Auto-Linked Nearest Branch: Station 1 (Main Hub - 0.3km)
                    </Text>
                  </View>

                  <View>
                    <Text style={authStyles.fieldLabel}>
                      Household / Office Name
                    </Text>
                    <View style={authStyles.inputRowBox}>
                      <TextInput
                        value={newCustomerName}
                        onChangeText={(text) => {
                          setNewCustomerName(text);
                        }}
                        style={authStyles.textInputField}
                      />
                    </View>
                  </View>

                  <View>
                    <Text style={authStyles.fieldLabel}>
                      Pinned Street Address
                    </Text>
                    <View style={authStyles.inputRowBox}>
                      <TextInput
                        value={pinnedAddress}
                        onChangeText={(text) => {
                          setPinnedAddress(text);
                        }}
                        style={authStyles.textInputField}
                      />
                    </View>
                  </View>

                  <View>
                    <Text style={authStyles.fieldLabel}>
                      Default Usual Gallons per Order
                    </Text>
                    <View style={authStyles.inputRowBox}>
                      <TextInput
                        value={defaultGallonsCount}
                        onChangeText={(text) => {
                          setDefaultGallonsCount(text);
                        }}
                        keyboardType="numeric"
                        style={authStyles.textInputField}
                      />
                    </View>
                  </View>

                  <Pressable
                    onPress={handlePressFinishProfileSetup}
                    style={authStyles.primaryLoginButton}
                  >
                    <CheckCircle2 size={16} color="#ffffff" />
                    <Text style={authStyles.primaryLoginButtonText}>
                      Save Profile &amp; Open 1-Click Home
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
