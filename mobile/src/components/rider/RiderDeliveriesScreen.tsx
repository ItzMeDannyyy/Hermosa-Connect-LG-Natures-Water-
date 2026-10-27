/**
 * ============================================================================
 * FILE: src/components/rider/RiderDeliveriesScreen.tsx
 * PURPOSE: Rider Delivery Manifest & Active Order Queue.
 *          Replaces turn-by-turn routing with a direct, practical dispatch
 *          queue where riders manage their own delivery patterns.
 *          Features 1-tap actions: AI container scan & doorstep receipt.
 *          Strict Lucide icons (lucide-react-native).
 * ============================================================================
 */

import {
  Banknote,
  Camera,
  CheckCircle2,
  Clock,
  Droplets,
  FileText,
  MapPin,
  Plus,
  Receipt,
  Search,
  Truck,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { riderStyles } from '../../styles/rider.styles';
import type { MobileOrderItem } from '../../types/mobile.types';

interface RiderDeliveriesScreenProps {
  riderName: string;
  branchName: string;
  orders: MobileOrderItem[];
  selectedOrderId: string;
  onSelectOrder?: (orderId: string) => void;
  onSelectOrderForAiCount: (orderId: string) => void;
  onSelectOrderForDoorstepReceipt: (orderId: string) => void;
}

export function RiderDeliveriesScreen(props: RiderDeliveriesScreenProps) {
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'DELIVERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = props.orders.filter((order) => {
    if (filterMode === 'PENDING' && order.documentStage === 'OFFICIAL_RECEIPT') {
      return false;
    }
    if (filterMode === 'DELIVERED' && order.documentStage !== 'OFFICIAL_RECEIPT') {
      return false;
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchAddress = order.deliveryAddress.toLowerCase().includes(q);
      const matchInvoice = order.invoiceNumber.toLowerCase().includes(q);
      return matchName || matchAddress || matchInvoice;
    }

    return true;
  });

  const pendingCount = props.orders.filter(
    (o) => o.documentStage !== 'OFFICIAL_RECEIPT',
  ).length;
  const deliveredCount = props.orders.filter(
    (o) => o.documentStage === 'OFFICIAL_RECEIPT',
  ).length;

  return (
    <ScrollView contentContainerStyle={riderStyles.scrollBody}>
      {/* 1. Header Banner */}
      <View style={riderStyles.riderHeaderBanner}>
        <View style={riderStyles.riderHeaderTopRow}>
          <View style={riderStyles.riderNameRow}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#0284c7',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={18} color="#ffffff" />
            </View>
            <View>
              <Text style={riderStyles.riderNameTitle}>{props.riderName}</Text>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                Delivery Rider · Dispatch Active
              </Text>
            </View>
          </View>

          <View style={riderStyles.branchPill}>
            <Text style={riderStyles.branchPillText}>{props.branchName}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Text style={riderStyles.tripSummarySubtitle}>
            {pendingCount} active {pendingCount === 1 ? 'delivery' : 'deliveries'} to complete
          </Text>
          <Text style={{ fontSize: 11, color: '#38bdf8', fontWeight: '700' }}>
            {deliveredCount} delivered today
          </Text>
        </View>
      </View>

      {/* 2. Filter Tabs & Search */}
      <View style={{ gap: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#e2e8f0',
            borderRadius: 8,
            padding: 3,
            gap: 4,
          }}
        >
          <Pressable
            onPress={() => setFilterMode('ALL')}
            style={{
              flex: 1,
              paddingVertical: 7,
              alignItems: 'center',
              borderRadius: 6,
              backgroundColor: filterMode === 'ALL' ? '#ffffff' : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: filterMode === 'ALL' ? '700' : '600',
                color: filterMode === 'ALL' ? '#0f172a' : '#64748b',
              }}
            >
              All ({props.orders.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterMode('PENDING')}
            style={{
              flex: 1,
              paddingVertical: 7,
              alignItems: 'center',
              borderRadius: 6,
              backgroundColor: filterMode === 'PENDING' ? '#ffffff' : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: filterMode === 'PENDING' ? '700' : '600',
                color: filterMode === 'PENDING' ? '#0284c7' : '#64748b',
              }}
            >
              Pending ({pendingCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterMode('DELIVERED')}
            style={{
              flex: 1,
              paddingVertical: 7,
              alignItems: 'center',
              borderRadius: 6,
              backgroundColor: filterMode === 'DELIVERED' ? '#ffffff' : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: filterMode === 'DELIVERED' ? '700' : '600',
                color: filterMode === 'DELIVERED' ? '#15803d' : '#64748b',
              }}
            >
              Delivered ({deliveredCount})
            </Text>
          </Pressable>
        </View>

        {/* Search input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#cbd5e1',
            borderRadius: 8,
            paddingHorizontal: 10,
            height: 38,
            gap: 8,
          }}
        >
          <Search size={15} color="#94a3b8" />
          <TextInput
            style={{ flex: 1, fontSize: 12, color: '#0f172a' }}
            placeholder="Search by customer, address, order #..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* 3. Deliveries List */}
      <View style={{ gap: 12 }}>
        {filteredOrders.length === 0 ? (
          <View
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              borderRadius: 12,
              padding: 32,
              alignItems: 'center',
            }}
          >
            <Truck size={28} color="#94a3b8" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 8 }}>
              No deliveries matching this filter.
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const isDelivered = order.documentStage === 'OFFICIAL_RECEIPT';
            const isSelected = props.selectedOrderId === order.id;

            return (
              <View
                key={order.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? '#0284c7' : '#e2e8f0',
                  borderRadius: 14,
                  padding: 14,
                  gap: 10,
                }}
              >
                {/* Top Row: Document Badge & Time */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                      style={{
                        paddingHorizontal: 7,
                        paddingVertical: 3,
                        borderRadius: 5,
                        backgroundColor: isDelivered ? '#ecfdf5' : '#eff6ff',
                        borderWidth: 1,
                        borderColor: isDelivered ? '#a7f3d0' : '#bfdbfe',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '800',
                          color: isDelivered ? '#15803d' : '#0284c7',
                          fontFamily: 'monospace',
                        }}
                      >
                        {isDelivered
                          ? `#${order.receiptNumber ?? `OR-${order.orderNumber}`}`
                          : `#${order.invoiceNumber}`}
                      </Text>
                    </View>

                    <View
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: '#f1f5f9',
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#475569' }}>
                        {order.paymentState.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#64748b" />
                    <Text style={{ fontSize: 11, color: '#64748b' }}>
                      {order.scheduledTimeSlot}
                    </Text>
                  </View>
                </View>

                {/* Customer Name & Address */}
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>
                    {order.customerName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <MapPin size={13} color="#64748b" />
                    <Text style={{ fontSize: 12, color: '#475569', flex: 1 }}>
                      {order.deliveryAddress}
                    </Text>
                  </View>
                </View>

                {/* Order Details Line */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc',
                    padding: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#f1f5f9',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Droplets size={14} color="#0284c7" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#0f172a' }}>
                      {order.verifiedCount} jugs ({order.presetName.split(' ')[0]})
                    </Text>
                    {order.emptyContainersToPickup > 0 && (
                      <Text style={{ fontSize: 11, color: '#64748b' }}>
                        · {order.emptyContainersToPickup} empties
                      </Text>
                    )}
                  </View>

                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color: '#0f172a',
                      fontFamily: 'monospace',
                    }}
                  >
                    ₱{order.totalDue.toFixed(2)}
                  </Text>
                </View>

                {/* Actions Row */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                  <Pressable
                    onPress={() => props.onSelectOrderForAiCount(order.id)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: '#f0f9ff',
                      borderWidth: 1,
                      borderColor: '#bae6fd',
                      borderRadius: 8,
                      paddingVertical: 9,
                    }}
                  >
                    <Camera size={14} color="#0284c7" />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284c7' }}>
                      AI Count
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => props.onSelectOrderForDoorstepReceipt(order.id)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: isDelivered ? '#f8fafc' : '#0f172a',
                      borderWidth: 1,
                      borderColor: isDelivered ? '#cbd5e1' : '#0f172a',
                      borderRadius: 8,
                      paddingVertical: 9,
                    }}
                  >
                    {isDelivered ? (
                      <>
                        <CheckCircle2 size={14} color="#15803d" />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#15803d' }}>
                          View Receipt
                        </Text>
                      </>
                    ) : (
                      <>
                        <Receipt size={14} color="#ffffff" />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff' }}>
                          Issue Receipt
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
