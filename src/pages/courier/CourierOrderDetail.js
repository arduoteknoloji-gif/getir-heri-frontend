import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Linking
} from 'react-native';
import * as Location from 'expo-location';
import api from '../../api';

const PURPLE = '#5C3EFF';

const STATUSES = [
  { key: 'assigned', label: 'Atandı' },
  { key: 'picked_up', label: 'Alındı' },
  { key: 'in_transit', label: 'Yolda' },
  { key: 'delivered', label: 'Teslim Edildi' },
];

export default function CourierOrderDetail({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [courierLocation, setCourierLocation] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
    } catch (e) {
      Alert.alert('Hata', 'Sipariş yüklenemedi');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    // Konum izni
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCourierLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    })();
  }, []);

  const updateStatus = async (newStatus) => {
    if (updating || order?.status === 'delivered') return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });
      await fetchOrder();
    } catch (e) {
      Alert.alert('Hata', 'Durum güncellenemedi');
    } finally {
      setUpdating(false);
    }
  };

  const openNavigation = () => {
    if (!courierLocation || !order) return;
    const dest = order.status === 'assigned'
      ? `${order.pickup_lat},${order.pickup_lng}`
      : `${order.customer_lat},${order.customer_lng}`;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&origin=${courierLocation.lat},${courierLocation.lng}&destination=${dest}&travelmode=driving`
    );
  };

  const callCustomer = () => {
    if (order?.customer_phone) {
      Linking.openURL(`tel:${order.customer_phone}`);
    }
  };

  const getPaymentInfo = () => {
    if (!order) return {};
    const total = (order.total_amount || 0) + (order.delivery_fee || 0);
    switch (order.payment_method) {
      case 'online': return { label: '✅ Online Ödeme Yapıldı', color: '#065F46', amount: null };
      case 'cash_on_delivery': return { label: '💵 Kapıda Nakit', color: '#92400E', amount: total };
      case 'card_on_delivery': return { label: '💳 Kapıda Kredi Kartı', color: '#1E40AF', amount: total };
      default: return { label: 'Belirtilmemiş', color: '#555', amount: total };
    }
  };

  const currentStatusIdx = STATUSES.findIndex(s => s.key === order?.status);
  const paymentInfo = getPaymentInfo();

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={PURPLE} /></View>;
  if (!order) return null;

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Sipariş Detayı</Text>
          <Text style={styles.headerSub}>#{(order._id || order.id)?.slice(0, 8)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Durum İlerleme */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Teslimat Durumu</Text>
          <View style={styles.statusProgress}>
            {STATUSES.map((s, i) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.statusStep, i <= currentStatusIdx && styles.statusStepActive, order.status === 'delivered' && styles.statusStepDisabled]}
                onPress={() => i > currentStatusIdx && updateStatus(s.key)}
                disabled={i <= currentStatusIdx || updating || order.status === 'delivered'}
              >
                <View style={[styles.statusDot, i <= currentStatusIdx && styles.statusDotActive]}>
                  <Text style={{ color: i <= currentStatusIdx ? '#fff' : '#999', fontSize: 12, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <Text style={[styles.statusLabel, i <= currentStatusIdx && styles.statusLabelActive]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {updating && <ActivityIndicator color={PURPLE} style={{ marginTop: 8 }} />}
        </View>

        {/* Ödeme Bilgisi */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: PURPLE }]}>
          <Text style={styles.sectionTitle}>Ödeme</Text>
          <Text style={[styles.paymentLabel, { color: paymentInfo.color }]}>{paymentInfo.label}</Text>
          {paymentInfo.amount && (
            <Text style={styles.paymentAmount}>₺{paymentInfo.amount.toFixed(2)}</Text>
          )}
        </View>

        {/* Aksiyon Butonları */}
        <View style={styles.actionRow}>
          {courierLocation && (
            <TouchableOpacity style={styles.navBtn} onPress={openNavigation}>
              <Text style={styles.navBtnText}>🧭 Navigasyon</Text>
            </TouchableOpacity>
          )}
          {order.customer_phone && (
            <TouchableOpacity style={styles.callBtn} onPress={callCustomer}>
              <Text style={styles.callBtnText}>📞 Ara</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Restoran */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🍔 Restoran</Text>
          <Text style={styles.infoName}>{order.restaurant_name}</Text>
          <Text style={styles.infoAddr}>📍 {order.pickup_address}</Text>
        </View>

        {/* Müşteri */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Müşteri</Text>
          <Text style={styles.infoName}>{order.customer_name}</Text>
          <Text style={styles.infoAddr}>📍 {order.customer_address}</Text>
          {order.customer_phone && (
            <Text style={styles.infoAddr}>📞 {order.customer_phone}</Text>
          )}
        </View>

        {/* Sipariş İçeriği */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📦 Sipariş İçeriği</Text>
          {order.items?.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} ×{item.quantity}</Text>
              <Text style={styles.itemPrice}>₺{item.price?.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalAmount}>₺{order.total_amount?.toFixed(2)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={[styles.totalLabel, { color: PURPLE }]}>Teslimat Ücreti</Text>
            <Text style={[styles.totalAmount, { color: PURPLE }]}>₺{order.delivery_fee?.toFixed(2)}</Text>
          </View>
        </View>

        {order.notes ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📝 Notlar</Text>
            <Text style={styles.notes}>{order.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#F0F0F0' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  headerSub: { fontSize: 12, color: '#999', fontFamily: 'monospace' },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  statusProgress: { flexDirection: 'row', justifyContent: 'space-between' },
  statusStep: { alignItems: 'center', flex: 1 },
  statusStepActive: {},
  statusStepDisabled: { opacity: 0.5 },
  statusDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statusDotActive: { backgroundColor: PURPLE },
  statusLabel: { fontSize: 10, color: '#999', textAlign: 'center' },
  statusLabelActive: { color: PURPLE, fontWeight: '700' },
  paymentLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  paymentAmount: { fontSize: 32, fontWeight: '800', color: '#111' },
  actionRow: { flexDirection: 'row', gap: 12 },
  navBtn: { flex: 1, backgroundColor: '#1D4ED8', padding: 14, borderRadius: 12, alignItems: 'center' },
  navBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  callBtn: { flex: 1, backgroundColor: '#059669', padding: 14, borderRadius: 12, alignItems: 'center' },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  infoName: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 6 },
  infoAddr: { fontSize: 14, color: '#555', marginBottom: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  itemName: { fontSize: 14, color: '#333', flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#111' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#111' },
  totalAmount: { fontSize: 16, fontWeight: '800', color: '#111' },
  notes: { fontSize: 14, color: '#555', lineHeight: 20 },
});