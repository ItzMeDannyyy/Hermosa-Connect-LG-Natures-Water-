/**
 * ============================================================================
 * FILE: src/components/rider/RiderAiPhotoCountScreen.tsx
 * PURPOSE: Implements Wireframe R2 (AI Photo Container Count & Instant Billing
 *          — Feature 04).
 *          - Captures real photo using device camera or gallery upload
 *          - Uses Google Gemini Vision AI to detect and count water gallons
 *          - Computes pre-dispatch Invoice (#INV) automatically
 *          - Zero mock simulation camera presets
 *          - Strict Lucide icons (lucide-react-native)
 * ============================================================================
 */

import * as ImagePicker from 'expo-image-picker';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Droplets,
  Image as ImageIcon,
  Minus,
  Plus,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { calculateOrderBillBreakdown } from '../../data/mobileInitialData';
import {
  countGallonsFromPhotoBase64,
  GeminiGallonCountResult,
} from '../../services/geminiVisionService';
import { customerStyles } from '../../styles/customer.styles';
import { riderStyles } from '../../styles/rider.styles';
import type { MobileOrderItem } from '../../types/mobile.types';

interface RiderAiPhotoCountScreenProps {
  order: MobileOrderItem;
  onUpdateVerifiedCount: (orderId: string, newCount: number) => void;
  onIssueInvoiceAndProceedToDoorstep: () => void;
  onBackToRoute: () => void;
}

export function RiderAiPhotoCountScreen(props: RiderAiPhotoCountScreenProps) {
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [geminiResult, setGeminiResult] = useState<GeminiGallonCountResult | null>(
    null,
  );

  const billBreakdown = calculateOrderBillBreakdown(props.order.verifiedCount);

  // Build explicit list of detected container indices [1..N]
  const detectedIndices: number[] = [];
  for (let index = 1; index <= props.order.verifiedCount; index = index + 1) {
    detectedIndices.push(index);
  }

  /**
   * Processes a captured or selected photo through Gemini Vision AI
   */
  async function processImageWithGemini(
    uri: string,
    base64Data: string | null | undefined,
    mimeType: string | undefined,
  ) {
    setCapturedPhotoUri(uri);
    setAnalysisError(null);
    setIsAnalyzing(true);

    try {
      if (!base64Data) {
        throw new Error('Image data could not be read as Base64 for AI processing.');
      }

      const result = await countGallonsFromPhotoBase64(
        base64Data,
        mimeType ?? 'image/jpeg',
      );

      setGeminiResult(result);

      // If Gemini detected containers, update the verified count
      if (result.detectedCount > 0) {
        props.onUpdateVerifiedCount(props.order.id, result.detectedCount);
      } else {
        // If 0 detected, keep current count or set to 0 and notify
        props.onUpdateVerifiedCount(props.order.id, result.detectedCount);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown AI processing error';
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  /**
   * Launches device camera to capture live load photo
   */
  async function handleLaunchCamera() {
    try {
      setAnalysisError(null);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setAnalysisError(
          'Camera permission is required to photograph water gallon containers.',
        );
        return;
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.75,
        base64: true,
      });

      if (!pickerResult.canceled && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        if (asset) {
          await processImageWithGemini(asset.uri, asset.base64, asset.mimeType);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to launch camera';
      setAnalysisError(message);
    }
  }

  /**
   * Launches gallery/file picker to select container load photo
   */
  async function handleLaunchImageLibrary() {
    try {
      setAnalysisError(null);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setAnalysisError(
          'Photo library access is required to choose a gallon container photo.',
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.75,
        base64: true,
      });

      if (!pickerResult.canceled && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        if (asset) {
          await processImageWithGemini(asset.uri, asset.base64, asset.mimeType);
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to open image library';
      setAnalysisError(message);
    }
  }

  /**
   * Increments verified count manually
   */
  function handleIncrementCount() {
    const nextCount = props.order.verifiedCount + 1;
    if (nextCount <= 99) {
      props.onUpdateVerifiedCount(props.order.id, nextCount);
    }
  }

  /**
   * Decrements verified count manually
   */
  function handleDecrementCount() {
    const nextCount = props.order.verifiedCount - 1;
    if (nextCount >= 0) {
      props.onUpdateVerifiedCount(props.order.id, nextCount);
    }
  }

  return (
    <ScrollView contentContainerStyle={riderStyles.scrollBody}>
      {/* Top Back Bar */}
      <Pressable
        onPress={props.onBackToRoute}
        style={customerStyles.secondaryActionCard}
      >
        <View style={customerStyles.secondaryActionLeft}>
          <ArrowLeft size={18} color="#0f172a" />
          <View>
            <Text style={customerStyles.secondaryActionTitle}>
              AI Photo Container Count (Order #{props.order.orderNumber})
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              Customer: {props.order.customerName}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 1. Camera / Captured Load Photo Viewport */}
      <View style={riderStyles.cameraViewportCard}>
        <View style={riderStyles.routeMapHeaderRow}>
          <View style={riderStyles.routeMapTitleRow}>
            <Sparkles size={16} color="#38bdf8" />
            <Text style={riderStyles.routeMapTitle}>
              GEMINI AI VISION CONTAINER AUDIT
            </Text>
          </View>
          {geminiResult ? (
            <View style={riderStyles.fuelSavedBadge}>
              <Text style={riderStyles.fuelSavedText}>GEMINI 3.5 FLASH</Text>
            </View>
          ) : null}
        </View>

        {capturedPhotoUri ? (
          <View style={riderStyles.photoPreviewContainer}>
            <Image
              source={{ uri: capturedPhotoUri }}
              style={riderStyles.capturedPhotoImage}
              resizeMode="cover"
            />
            {isAnalyzing ? (
              <View style={riderStyles.analyzingOverlay}>
                <ActivityIndicator size="large" color="#38bdf8" />
                <Text style={riderStyles.analyzingTitle}>
                  Analyzing Photo with Gemini AI...
                </Text>
                <Text style={riderStyles.analyzingSubtitle}>
                  Counting 5-gallon water containers and bottles
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={riderStyles.emptyPhotoPlaceholder}>
            <Camera size={38} color="#64748b" />
            <Text style={riderStyles.emptyPhotoTitle}>
              No Photo Captured Yet
            </Text>
            <Text style={riderStyles.emptyPhotoSubtitle}>
              Take a picture of the loaded delivery containers or vehicle rack.
              Gemini Vision AI will automatically count the gallons.
            </Text>
          </View>
        )}

        {/* Visual indicators for detected containers [1..N] */}
        {detectedIndices.length > 0 ? (
          <View style={riderStyles.cameraBoxesContainer}>
            {detectedIndices.map((jugNumber) => {
              return (
                <View key={jugNumber} style={riderStyles.detectedJugBox}>
                  <Droplets size={16} color="#34d399" />
                  <Text style={riderStyles.detectedJugIndexLabel}>
                    [{jugNumber}]
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* AI Confidence / Status Banner */}
        <View style={riderStyles.aiConfidenceBanner}>
          <CheckCircle2 size={14} color="#34d399" />
          <Text style={riderStyles.aiConfidenceText}>
            {props.order.verifiedCount} containers detected •{' '}
            {geminiResult ? geminiResult.confidence : props.order.aiConfidencePercent}% AI Confidence
          </Text>
        </View>
      </View>

      {/* AI Error Alert if any */}
      {analysisError ? (
        <View style={riderStyles.aiErrorCard}>
          <AlertCircle size={18} color="#ef4444" />
          <Text style={riderStyles.aiErrorText}>{analysisError}</Text>
        </View>
      ) : null}

      {/* Gemini AI Observation Note */}
      {geminiResult ? (
        <View style={riderStyles.aiNotesCard}>
          <Sparkles size={16} color="#16a34a" />
          <Text style={riderStyles.aiNotesText}>
            AI Observation: {geminiResult.notes}
          </Text>
        </View>
      ) : null}

      {/* 2. Real Camera & Gallery Capture Actions (NO SIMULATION) */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>
          CAMERA CAPTURE & AI COUNTING
        </Text>

        <View style={riderStyles.captureActionsGrid}>
          <Pressable
            onPress={() => {
              void handleLaunchCamera();
            }}
            disabled={isAnalyzing}
            style={[
              riderStyles.cameraPrimaryButton,
              isAnalyzing ? { opacity: 0.6 } : null,
            ]}
          >
            <Camera size={16} color="#ffffff" />
            <Text style={riderStyles.cameraPrimaryButtonText}>
              {capturedPhotoUri ? 'Retake Photo' : 'Take Photo'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              void handleLaunchImageLibrary();
            }}
            disabled={isAnalyzing}
            style={[
              riderStyles.gallerySecondaryButton,
              isAnalyzing ? { opacity: 0.6 } : null,
            ]}
          >
            <ImageIcon size={16} color="#2563eb" />
            <Text style={riderStyles.gallerySecondaryButtonText}>
              Choose Photo
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 3. Manual Fine-Tuning Adjuster (+ / -) */}
      <View style={riderStyles.adjusterContainer}>
        <View style={riderStyles.adjusterHeaderRow}>
          <Text style={riderStyles.adjusterTitle}>
            VERIFIED CONTAINER COUNT (MANUAL OVERRIDE)
          </Text>
          <Text style={customerStyles.secondaryActionSub}>
            Tap + or – to adjust
          </Text>
        </View>

        <View style={riderStyles.adjusterControlsRow}>
          <Pressable
            onPress={handleDecrementCount}
            disabled={props.order.verifiedCount <= 0 || isAnalyzing}
            style={[
              riderStyles.adjusterButton,
              props.order.verifiedCount <= 0 ? { opacity: 0.4 } : null,
            ]}
          >
            <Minus size={20} color="#0f172a" />
          </Pressable>

          <View style={riderStyles.adjusterDisplayBox}>
            <Text style={riderStyles.adjusterNumber}>
              {props.order.verifiedCount}
            </Text>
            <Text style={riderStyles.adjusterUnitsLabel}>
              5-Gallon Containers
            </Text>
          </View>

          <Pressable
            onPress={handleIncrementCount}
            disabled={props.order.verifiedCount >= 99 || isAnalyzing}
            style={[
              riderStyles.adjusterButton,
              props.order.verifiedCount >= 99 ? { opacity: 0.4 } : null,
            ]}
          >
            <Plus size={20} color="#0f172a" />
          </Pressable>
        </View>
      </View>

      {/* 4. Auto-Generated Pre-Dispatch Bill (#INV) */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>
          AUTO-GENERATED BILL (PRE-DISPATCH #{props.order.invoiceNumber})
        </Text>

        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>
            {props.order.verifiedCount} containers refilled (× PHP{' '}
            {props.order.unitPrice})
          </Text>
          <Text style={customerStyles.billRowValue}>
            PHP {billBreakdown.subtotalAmount.toFixed(2)}
          </Text>
        </View>

        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>Delivery fee</Text>
          <Text style={customerStyles.billRowValue}>
            PHP {billBreakdown.deliveryFee.toFixed(2)}
          </Text>
        </View>

        <View style={customerStyles.billTotalRow}>
          <Text style={customerStyles.billTotalLabel}>TOTAL DUE</Text>
          <Text style={customerStyles.billTotalValue}>
            PHP {billBreakdown.totalDue.toFixed(2)}
          </Text>
        </View>

        <View style={riderStyles.stopActionsRow}>
          {capturedPhotoUri ? (
            <Pressable
              onPress={() => {
                void handleLaunchCamera();
              }}
              style={riderStyles.stopSecondaryButton}
            >
              <RefreshCw size={15} color="#2563eb" />
              <Text style={riderStyles.stopSecondaryButtonText}>Retake</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={props.onIssueInvoiceAndProceedToDoorstep}
            style={[riderStyles.stopPrimaryButton, { flex: 2 }]}
          >
            <Zap size={16} color="#ffffff" />
            <Text style={riderStyles.stopPrimaryButtonText}>
              ISSUE INVOICE #{props.order.invoiceNumber}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
