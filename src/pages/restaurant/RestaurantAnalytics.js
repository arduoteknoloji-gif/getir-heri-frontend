import React, { useState, useEffect, useCallback } from 'react';
import { RestaurantLayout } from '../../components/RestaurantLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Package, CurrencyDollar, CheckCircle, TrendUp } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function RestaurantAnalytics() {
  const { user } = useAuth();
  
  // DÜZELTME: restaurant_id user._id'den alınır
  const restaurantId = user?._id || user?.id;
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    // DÜZELTME: restaurantId kontrolü
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get(`/restaurants/${restaurantId}/analytics`);
      setAnalytics(data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Analitik veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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
        <div>
          <h2 className="text-2xl font-bold">Analitik</h2>
          <p className="text-sm text-muted-foreground mt-1">Performans metrikleri</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Toplam Sipariş</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{analytics?.total_orders || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tamamlanan</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{analytics?.completed_orders || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CurrencyDollar size={20} className="text-green-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Toplam Gelir</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">₺{analytics?.total_revenue?.toFixed(2) || '0.00'}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendUp size={20} className="text-blue-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ort. Sipariş</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">₺{analytics?.average_order_value?.toFixed(2) || '0.00'}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/40 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp size={24} className="text-primary" />
              Performans Özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tamamlanma Oranı</span>
              <span className="text-xl font-bold">
                {analytics?.total_orders > 0
                  ? ((analytics.completed_orders / analytics.total_orders) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Aktif Sipariş</span>
              <span className="text-xl font-bold">
                {(analytics?.total_orders || 0) - (analytics?.completed_orders || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </RestaurantLayout>
  );
}