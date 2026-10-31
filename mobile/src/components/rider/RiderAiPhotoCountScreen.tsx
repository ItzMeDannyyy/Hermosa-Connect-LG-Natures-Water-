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
import { cardStyles } from '../../styles/card.styles';
import { riderStyles } from '../../styles/rider.styles';
import type { MobileOrderItem } from '../../types/mobile.types';

interface RiderAiPhotoCountScreenProps {
  order?: MobileOrderItem | null;
  onUpdateVerifiedCount: (orderId: string, newCount: number) => void;
  onIssueInvoiceAndProceedToDoorstep: () => void;
  onBackToDeliveries: () => void;
}

export function RiderAiPhotoCountScreen(props: RiderAiPhotoCountScreenProps) {
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [geminiResult, setGeminiResult] = useState<GeminiGallonCountResult | null>(
    null,
  );

  if (!props.order) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f1f5f9',
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Camera size={40} color="#94a3b8" />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#0f172a',
            marginTop: 12,
          }}
        >
          No Delivery Order Selected
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: '#64748b',
            textAlign: 'center',
            marginTop: 6,
            marginBottom: 20,
            lineHeight: 18,
          }}
        >
          There are currently no active deliveries in your manifest. Select an order from your deliveries queue to scan containers.
        </Text>
        <Pressable
          onPress={props.onBackToDeliveries}
          style={{
            backgroundColor: '#0284c7',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>
            Back to Deliveries
          </Text>
        </Pressable>
      </View>
    );
  }

  const currentOrder = props.order;
  const billBreakdown = calculateOrderBillBreakdown(currentOrder.verifiedCount);

  // Build explicit list of detected container indices [1..N]
  const detectedIndices: number[] = [];
  for (let index = 1; index <= currentOrder.verifiedCount; index = index + 1) {
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
        props.onUpdateVerifiedCount(currentOrder.id, result.detectedCount);
      } else {
        // If 0 detected, keep current count or set to 0 and notify
        props.onUpdateVerifiedCount(currentOrder.id, result.detectedCount);
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
    const nextCount = currentOrder.verifiedCount + 1;
    if (nextCount <= 99) {
      props.onUpdateVerifiedCount(currentOrder.id, nextCount);
    }
  }

  /**
   * Decrements verified count manually
   */
  function handleDecrementCount() {
    const nextCount = currentOrder.verifiedCount - 1;
    if (nextCount >= 0) {
      props.onUpdateVerifiedCount(currentOrder.id, nextCount);
    }
  }

  return (
    <ScrollView contentContainerStyle={riderStyles.scrollBody}>
      {/* Top Back Bar */}
      <Pressable
        onPress={props.onBackToDeliveries}
        style={cardStyles.secondaryActionCard}
      >
        <View style={cardStyles.secondaryActionLeft}>
          <ArrowLeft size={18} color="#0f172a" />
          <View>
            <Text style={cardStyles.secondaryActionTitle}>
              AI Photo Container Count (Order #{currentOrder.orderNumber})
            </Text>
            <Text style={cardStyles.secondaryActionSub}>
              Customer: {currentOrder.customerName}
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
            {currentOrder.verifiedCount} containers detected •{' '}
            {geminiResult ? geminiResult.confidence : currentOrder.aiConfidencePercent}% AI Confidence
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
      <View style={cardStyles.whitePanelCard}>
        <Text style={cardStyles.sectionLabel}>
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
          <Text style={cardStyles.secondaryActionSub}>
            Tap + or – to adjust
          </Text>
        </View>

        <View style={riderStyles.adjusterControlsRow}>
          <Pressable
            onPress={handleDecrementCount}
            disabled={currentOrder.verifiedCount <= 0 || isAnalyzing}
            style={[
              riderStyles.adjusterButton,
              currentOrder.verifiedCount <= 0 ? { opacity: 0.4 } : null,
            ]}
          >
            <Minus size={20} color="#0f172a" />
          </Pressable>

          <View style={riderStyles.adjusterDisplayBox}>
            <Text style={riderStyles.adjusterNumber}>
              {currentOrder.verifiedCount}
            </Text>
            <Text style={riderStyles.adjusterUnitsLabel}>
              5-Gallon Containers
            </Text>
          </View>

          <Pressable
            onPress={handleIncrementCount}
            disabled={currentOrder.verifiedCount >= 99 || isAnalyzing}
            style={[
              riderStyles.adjusterButton,
              currentOrder.verifiedCount >= 99 ? { opacity: 0.4 } : null,
            ]}
          >
            <Plus size={20} color="#0f172a" />
          </Pressable>
        </View>
      </View>

      {/* 4. Auto-Generated Pre-Dispatch Bill (#INV) */}
      <View style={cardStyles.whitePanelCard}>
        <Text style={cardStyles.sectionLabel}>
          AUTO-GENERATED BILL (PRE-DISPATCH #{currentOrder.invoiceNumber})
        </Text>

        <View style={cardStyles.billRow}>
          <Text style={cardStyles.billRowLabel}>
            {currentOrder.verifiedCount} containers refilled (× PHP{' '}
            {currentOrder.unitPrice})
          </Text>
          <Text style={cardStyles.billRowValue}>
            PHP {billBreakdown.subtotalAmount.toFixed(2)}
          </Text>
        </View>

        <View style={cardStyles.billRow}>
          <Text style={cardStyles.billRowLabel}>Delivery fee</Text>
          <Text style={cardStyles.billRowValue}>
            PHP {billBreakdown.deliveryFee.toFixed(2)}
          </Text>
        </View>

        <View style={cardStyles.billTotalRow}>
          <Text style={cardStyles.billTotalLabel}>TOTAL DUE</Text>
          <Text style={cardStyles.billTotalValue}>
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
              ISSUE INVOICE #{currentOrder.invoiceNumber}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
