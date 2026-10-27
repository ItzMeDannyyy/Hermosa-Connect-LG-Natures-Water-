/**
 * ============================================================================
 * FILE: src/components/auth/MobileLoginScreen.tsx
 * PURPOSE: Mobile Authentication & Customer Delivery Profile Onboarding.
 *          Features refined water refilling station aesthetics, instant demo
 *          credential pickers (Customer / Rider), and clean typography.
 *          Strict Lucide icons (lucide-react-native).
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
  Truck,
  User,
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
  const [activePreset, setActivePreset] = useState<'CUSTOMER' | 'RIDER'>('CUSTOMER');

  // Customer Delivery Profile Setup State
  const [isStepTwoOpen, setIsStepTwoOpen] = useState<boolean>(false);
  const [newCustomerName, setNewCustomerName] = useState<string>('Maria Santos');
  const [pinnedAddress, setPinnedAddress] = useState<string>(
    'Blk 4 Lot 12 Pansol St, Quezon City',
  );
  const [defaultGallonsCount, setDefaultGallonsCount] = useState<string>('8');

  function handleSelectPreset(role: 'CUSTOMER' | 'RIDER') {
    setActivePreset(role);
    if (role === 'CUSTOMER') {
      setPhoneNumber('+639170000003');
      setPassword('password123');
    } else {
      setPhoneNumber('+639170000002');
      setPassword('password123');
    }
  }

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
        {/* Brand Crest & Title */}
        <View style={authStyles.brandHeaderBlock}>
          <View style={authStyles.brandCrestBox}>
            <Droplets size={32} color="#38bdf8" />
          </View>
          <Text style={authStyles.brandTitleText}>LG NATURE&apos;S WATER</Text>
          <Text style={authStyles.brandSubtitleText}>
            Purified Water Refilling &amp; Smart Dispatch
          </Text>
        </View>

        {/* White Sign In Card */}
        <View style={authStyles.loginOuterRing}>
          <View style={authStyles.loginWhiteCard}>
            <View style={authStyles.cardTopHeaderRow}>
              <View style={authStyles.cardIconBadge}>
                <Droplets size={18} color="#0284c7" />
              </View>

              <View style={authStyles.onlineStatusPill}>
                <View style={authStyles.onlineDot} />
                <Text style={authStyles.onlineStatusText}>
                  Station 1 Hub Online
                </Text>
              </View>
            </View>

            <View>
              <Text style={authStyles.cardHeading}>Sign In</Text>
              <Text style={authStyles.cardSubtitle}>
                Select an account role or enter your mobile credentials.
              </Text>
            </View>

            {/* Quick Demo Account Selector */}
            <View style={authStyles.demoAccountQuickRow}>
              <Pressable
                onPress={() => handleSelectPreset('CUSTOMER')}
                style={[
                  authStyles.demoQuickPill,
                  activePreset === 'CUSTOMER' ? authStyles.demoQuickPillActive : null,
                ]}
              >
                <User size={13} color={activePreset === 'CUSTOMER' ? '#0284c7' : '#64748b'} />
                <Text style={authStyles.demoQuickPillText}>Customer (Maria)</Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelectPreset('RIDER')}
                style={[
                  authStyles.demoQuickPill,
                  activePreset === 'RIDER' ? authStyles.demoQuickPillActive : null,
                ]}
              >
                <Truck size={13} color={activePreset === 'RIDER' ? '#0284c7' : '#64748b'} />
                <Text style={authStyles.demoQuickPillText}>Rider (J. Cruz)</Text>
              </Pressable>
            </View>

            {/* Phone Number Field */}
            <View style={authStyles.fieldBlock}>
              <Text style={authStyles.fieldLabel}>Mobile Number</Text>
              <View style={authStyles.inputRowBox}>
                <Text style={authStyles.phFlagPrefix}>PH +63</Text>
                <Phone size={15} color="#64748b" />
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
                <Lock size={15} color="#64748b" />
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
                    <EyeOff size={16} color="#64748b" />
                  ) : (
                    <Eye size={16} color="#64748b" />
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
              <LogIn size={16} color="#ffffff" />
              <Text style={authStyles.primaryLoginButtonText}>
                {props.isSubmitting ? 'SIGNING IN...' : 'SIGN IN TO STATION'}
              </Text>
            </Pressable>

            {/* Customer Onboarding Section */}
            <View style={authStyles.signupDividerBlock}>
              <Text style={authStyles.signupPromptText}>
                Need a new delivery address profile?
              </Text>

              <Pressable
                onPress={() => {
                  setIsStepTwoOpen(!isStepTwoOpen);
                }}
                style={authStyles.secondaryOutlineButton}
              >
                <UserPlus size={14} color="#0369a1" />
                <Text style={authStyles.secondaryOutlineButtonText}>
                  {isStepTwoOpen ? 'Close Delivery Setup' : 'Register 1-Click Delivery Profile'}
                </Text>
              </Pressable>

              {isStepTwoOpen && (
                <View style={authStyles.stepTwoProfileBox}>
                  <Text style={authStyles.stepTwoTitle}>
                    Delivery Address &amp; Usual Refill Volume
                  </Text>

                  <View style={authStyles.gpsPinPreviewCard}>
                    <MapPin size={15} color="#0284c7" />
                    <Text style={authStyles.gpsPinText}>
                      Assigned Station: Station 1 Hub (Pansol / Katipunan)
                    </Text>
                  </View>

                  <View style={authStyles.fieldBlock}>
                    <Text style={authStyles.fieldLabel}>
                      Customer / Household Name
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

                  <View style={authStyles.fieldBlock}>
                    <Text style={authStyles.fieldLabel}>
                      Delivery Street Address
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

                  <View style={authStyles.fieldBlock}>
                    <Text style={authStyles.fieldLabel}>
                      Default Gallons per Order
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
                      Save Profile &amp; Continue
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
