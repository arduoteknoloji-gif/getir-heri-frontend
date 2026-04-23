import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, MapPin, Phone, Package, Storefront, Compass, CreditCard, Money } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function CourierOrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [courierLocation, setCourierLocation] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data?.data || data || null);
    } catch (error) {
      console.error('Sipariş getirme hatası:', error);
      toast.error('Sipariş yüklenemedi');
      navigate('/courier/dashboard');
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  // Tarayıcı Geolocation API'si (expo yerine)
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCourierLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.error('Konum hatası:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Konum güncelle
  const updateCourierLocation = useCallback(async (location) => {
    if (!user?._id || !location) return;
    try {
      await api.patch(`/couriers/${user._id}/location`, {
        lat: location.lat,
        lng: location.lng,
      });
    } catch (error) {
      console.error('Konum güncelleme hatası:', error);
    }
  }, [user?._id]);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId, fetchOrder]);

  useEffect(() => {
    if (courierLocation && order && order.status !== 'delivered') {
      updateCourierLocation(courierLocation);
    }
  }, [courierLocation, order, updateCourierLocation]);

  const updateStatus = async (newStatus) => {
    if (updating || order?.status === 'delivered') return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });
      toast.success('Durum güncellendi');
      fetchOrder();
    } catch (error) {
      toast.error('Durum güncellenemedi');
    } finally {
      setUpdating(false);
    }
  };

  const getPaymentInfo = () => {
    if (!order?.payment_method) {
      return { icon: <Money size={22} className="text-muted-foreground" />, title: "Ödeme Yöntemi Belirtilmemiş", subtitle: "", amount: (order?.total_amount || 0) + (order?.delivery_fee || 0), color: "text-muted-foreground" };
    }
    const totalToCollect = (order.total_amount || 0) + (order.delivery_fee || 0);
    switch (order.payment_method) {
      case 'online':
        return { icon: <CreditCard size={22} className="text-green-600" />, title: "Online Ödeme Yapıldı", subtitle: "Kuryeye ödeme yapılmayacak", amount: null, color: "text-green-600" };
      case 'cash_on_delivery':
        return { icon: <Money size={22} className="text-amber-600" />, title: "Kapıda Nakit Ödeme", subtitle: "Müşteriden alınacak tutar", amount: totalToCollect, color: "text-amber-600" };
      case 'card_on_delivery':
        return { icon: <CreditCard size={22} className="text-blue-600" />, title: "Kapıda Kredi Kartı", subtitle: "POS cihazı ile tahsil edilecek", amount: totalToCollect, color: "text-blue-600" };
      default:
        return { icon: <Money size={22} className="text-muted-foreground" />, title: "Ödeme Yöntemi Belirtilmemiş", subtitle: "", amount: totalToCollect, color: "text-muted-foreground" };
    }
  };

  const paymentInfo = getPaymentInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-border/40">
        <div className="px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/courier/dashboard')}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Sipariş Detayları</h1>
            <p className="text-xs text-muted-foreground">#{order.id || order._id}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* Ödeme Bilgisi */}
        <Card className={`border-border/40 border-l-4 ${
          paymentInfo.color.includes('amber') ? 'border-l-amber-500' :
          paymentInfo.color.includes('blue') ? 'border-l-blue-500' :
          paymentInfo.color.includes('green') ? 'border-l-green-500' : 'border-l-gray-400'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {paymentInfo.icon} Ödeme Bilgisi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className={`text-lg font-semibold ${paymentInfo.color}`}>{paymentInfo.title}</p>
            {paymentInfo.subtitle && <p className="text-sm text-muted-foreground">{paymentInfo.subtitle}</p>}
            {paymentInfo.amount && (
              <div className="pt-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-1">ALINACAK TUTAR</p>
                <p className="text-3xl font-bold">₺{paymentInfo.amount.toFixed(2)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigasyon Butonu */}
        {courierLocation && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              const destination = order.status === 'assigned'
                ? `${order.pickup_lat},${order.pickup_lng}`
                : `${order.customer_lat},${order.customer_lng}`;
              window.open(`https://www.google.com/maps/dir/?api=1&origin=${courierLocation.lat},${courierLocation.lng}&destination=${destination}&travelmode=driving`, '_blank');
            }}
          >
            <Compass size={18} className="mr-2" weight="bold" />
            Navigasyonu Başlat
          </Button>
        )}

        {/* Durum Güncelle */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Sipariş Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={order.status} onValueChange={updateStatus} disabled={updating || order.status === 'delivered'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assigned">Atandı</SelectItem>
                <SelectItem value="picked_up">Alındı</SelectItem>
                <SelectItem value="in_transit">Yolda</SelectItem>
                <SelectItem value="delivered">Teslim Edildi</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Restoran */}
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Storefront size={20} className="text-primary" />
              <CardTitle className="text-base">Restoran</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{order.restaurant_name}</p>
            <div className="flex items-start gap-2 mt-2 text-sm">
              <MapPin size={16} className="text-muted-foreground mt-0.5" />
              <p className="text-muted-foreground">{order.pickup_address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Müşteri */}
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package size={20} className="text-primary" />
              <CardTitle className="text-base">Müşteri</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">{order.customer_name}</p>
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">{order.customer_address}</p>
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground" />
                <a href={`tel:${order.customer_phone}`} className="text-sm text-primary hover:underline">
                  {order.customer_phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sipariş İçeriği */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Sipariş İçeriği</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name} ×{item.quantity}</span>
                  <span className="font-medium">₺{item.price?.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-border/40 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam</span>
                  <span>₺{order.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span>Teslimat Ücreti</span>
                  <span className="text-primary">₺{order.delivery_fee?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {order.notes && (
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
