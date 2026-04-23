import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, MapPin, Package, CurrencyDollar, ClockCounterClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function CourierHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/orders');

      // GÜVENLİK: data her zaman dizi olmayabilir
      const ordersData = Array.isArray(data) ? data : (data?.data || []);
      
      const deliveredOrders = ordersData.filter((o) =>
        o.courier_id === user._id &&
        (o.status === 'delivered' || o.status === 'cancelled')
      );

      setOrders(deliveredOrders);
    } catch (error) {
      console.error('History fetch error:', error);
      toast.error('Geçmiş yüklenemedi');
      setOrders([]); // Hata durumunda boş dizi
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-border/40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/courier/dashboard')}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Teslimat Geçmişi</h1>
              <p className="text-xs text-muted-foreground">{orders.length} teslimat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="p-8 text-center">
              <ClockCounterClockwise size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz tamamlanmış teslimatınız yok</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order._id || order.id} className="border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{order.restaurant_name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.updated_at || order.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Badge
                    className={order.status === 'delivered'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'}
                    variant="outline"
                  >
                    {order.status === 'delivered' ? 'Teslim Edildi' : 'İptal'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_address}</p>
                  </div>
                </div>

                {order.status === 'delivered' && (
                  <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                    <CurrencyDollar size={18} className="text-primary" />
                    <span className="text-sm font-semibold">Kazanç:</span>
                    <span className="text-sm font-bold text-primary">
                      ₺{order.delivery_fee?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/40 z-50">
        <div className="flex items-center justify-around px-4 py-3">
          <button onClick={() => navigate('/courier/dashboard')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <Package size={24} />
            <span className="text-xs">Siparişler</span>
          </button>
          <button onClick={() => navigate('/courier/history')} className="flex flex-col items-center gap-1 text-primary">
            <ClockCounterClockwise size={24} weight="bold" />
            <span className="text-xs font-medium">Geçmiş</span>
          </button>
          <button onClick={() => navigate('/courier/earnings')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <CurrencyDollar size={24} />
            <span className="text-xs">Kazançlar</span>
          </button>
        </div>
      </div>
    </div>
  );
}