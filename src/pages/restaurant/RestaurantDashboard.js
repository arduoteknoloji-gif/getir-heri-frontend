import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantLayout } from '../../components/RestaurantLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Package, CurrencyDollar, Clock, Plus, Motorcycle } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // DÜZELTME: restaurant_id user._id'den alınır
  const restaurantId = user?._id || user?.id;

  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // DÜZELTME: restaurantId kontrolü
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [ordersRes, analyticsRes, couriersRes] = await Promise.all([
        api.get('/orders'),
        api.get(`/restaurants/${restaurantId}/analytics`),
        api.get('/couriers')
      ]);

      setOrders(ordersRes.data?.orders?.slice(0, 5) || []);
      setAnalytics(analyticsRes.data);
      setCouriers(couriersRes.data?.data || []);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Veriler yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId, fetchData]);

  const availableCouriers = couriers.filter(c => c.status === 'available');
  const busyCouriers = couriers.filter(c => c.status === 'busy');
  const offlineCouriers = couriers.filter(c => c.status === 'offline');

  const getStatusBadge = (status) => {
    const variants = {
      pending: { label: 'Bekliyor', className: 'bg-amber-100 text-amber-800' },
      assigned: { label: 'Atandı', className: 'bg-blue-100 text-blue-800' },
      picked_up: { label: 'Alındı', className: 'bg-purple-100 text-purple-800' },
      in_transit: { label: 'Yolda', className: 'bg-indigo-100 text-indigo-800' },
      delivered: { label: 'Teslim Edildi', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'İptal', className: 'bg-red-100 text-red-800' }
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Hoş geldiniz, {user?.name || 'Restoran Yetkilisi'}
            </p>
          </div>
          <Button onClick={() => navigate('/restaurant/orders/new')}>
            <Plus size={18} className="mr-2" weight="bold" />
            Yeni Sipariş
          </Button>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Toplam Sipariş</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{analytics?.total_orders || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-green-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tamamlanan</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{analytics?.completed_orders || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CurrencyDollar size={20} className="text-green-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gelir</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₺{analytics?.total_revenue?.toFixed(2) || '0.00'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Aktif Kuryeler */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Motorcycle size={20} /> Aktif Kuryeler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                🟢 Müsait Kuryeler ({availableCouriers.length})
              </p>
              {availableCouriers.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-2">Şu anda müsait kurye bulunmuyor</p>
              ) : (
                availableCouriers.map(courier => (
                  <div key={courier._id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{courier.name}</p>
                      <p className="text-xs text-muted-foreground">{courier.phone}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Müsait</Badge>
                  </div>
                ))
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-600 mb-3 flex items-center gap-2">
                🟡 Meşgul Kuryeler ({busyCouriers.length})
              </p>
              {busyCouriers.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-2">Meşgul kurye yok</p>
              ) : (
                busyCouriers.map(courier => (
                  <div key={courier._id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{courier.name}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Meşgul</Badge>
                  </div>
                ))
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                🔴 Çevrim Dışı Kuryeler ({offlineCouriers.length})
              </p>
              {offlineCouriers.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-2">Çevrim dışı kurye yok</p>
              ) : (
                offlineCouriers.map(courier => (
                  <div key={courier._id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-muted-foreground">{courier.name}</p>
                    </div>
                    <Badge variant="outline">Çevrim Dışı</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Son Siparişler */}
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Son Siparişler</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/restaurant/orders')}>
                Tümünü Gör
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Henüz sipariş yok</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order._id || order.id}
                    className="flex items-center justify-between p-3 border border-border/40 rounded-sm hover:bg-secondary/50 transition-all duration-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_address}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold">₺{order.total_amount?.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </RestaurantLayout>
  );
}