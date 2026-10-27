/**
 * ============================================================================
 * FILE: src/components/auth/MobileLoginScreen.tsx
 * PURPOSE: Mobile Authentication for Delivery Riders.
 *          Refined water station aesthetics, quick demo credentials,
 *          and strict Lucide vector icons (lucide-react-native).
 * ============================================================================
 */

import {
  Droplets,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Phone,
  Truck,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { authStyles } from '../../styles/auth.styles';

interface MobileLoginScreenProps {
  isSubmitting: boolean;
  onLoginSubmit: (phoneNumber: string, password: string) => void;
}

export function MobileLoginScreen(props: MobileLoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('+639170000002');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  function handleTogglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  function handlePressLoginButton() {
    props.onLoginSubmit(phoneNumber, password);
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
            Rider Delivery &amp; Dispatch Terminal
          </Text>
        </View>

        {/* White Sign In Card */}
        <View style={authStyles.loginOuterRing}>
          <View style={authStyles.loginWhiteCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: '#0284c7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Truck size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>
                  Rider Dispatch Sign In
                </Text>
                <Text style={{ fontSize: 12, color: '#64748b' }}>
                  Log in to access assigned delivery orders
                </Text>
              </View>
            </View>

            {/* Phone Number Input */}
            <View style={authStyles.fieldBlock}>
              <Text style={authStyles.fieldLabel}>Mobile Phone Number</Text>
              <View style={authStyles.inputRowBox}>
                <Phone size={18} color="#64748b" />
                <TextInput
                  style={authStyles.textInputField}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="+639170000002"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  editable={!props.isSubmitting}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={authStyles.fieldBlock}>
              <Text style={authStyles.fieldLabel}>Security Password</Text>
              <View style={authStyles.inputRowBox}>
                <Lock size={18} color="#64748b" />
                <TextInput
                  style={authStyles.textInputField}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  editable={!props.isSubmitting}
                />
                <Pressable
                  onPress={handleTogglePasswordVisibility}
                  accessibilityLabel="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#64748b" />
                  ) : (
                    <Eye size={18} color="#64748b" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handlePressLoginButton}
              disabled={props.isSubmitting}
              style={[
                authStyles.primaryLoginButton,
                props.isSubmitting ? { opacity: 0.6 } : null,
              ]}
            >
              <LogIn size={18} color="#ffffff" />
              <Text style={authStyles.primaryLoginButtonText}>
                {props.isSubmitting
                  ? 'Connecting to Dispatch...'
                  : 'Sign In as Delivery Rider'}
              </Text>
            </Pressable>

            {/* Demo Helper Note */}
            <View
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#f8fafc',
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 2 }}>
                Demo Credentials:
              </Text>
              <Text style={{ fontSize: 11, color: '#64748b' }}>
                Phone: <Text style={{ fontFamily: 'monospace', fontWeight: '600' }}>+639170000002</Text>
              </Text>
              <Text style={{ fontSize: 11, color: '#64748b' }}>
                Password: <Text style={{ fontFamily: 'monospace', fontWeight: '600' }}>password123</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
