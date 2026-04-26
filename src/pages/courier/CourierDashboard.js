import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Motorcycle, MapPin, CurrencyDollar, Package, SignOut, ClockCounterClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function CourierDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  // localStorage'dan mevcut durumu oku - sayfa değişince sıfırlanmaz
  const [courierStatus, setCourierStatus] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored).status || 'offline';
    } catch (e) {}
    return user?.status || 'offline';
  });

  // Durum güncelleme
  const updateCourierStatus = useCallback(async (newStatus) => {
    if (!user?._id) return;
    try {
      await api.patch(`/couriers/${user._id}/status`, { status: newStatus });
      setCourierStatus(newStatus);
      // localStorage'daki user objesini de güncelle
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const updatedUser = { ...JSON.parse(stored), status: newStatus };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (e) {}
      const messages = {
        available: '✅ Artık müsaitsiniz.',
        busy: '🟡 Meşgul moduna geçtiniz.',
        offline: '🔴 Çevrim dışı oldunuz.'
      };
      toast.success(messages[newStatus] || 'Durum güncellendi');
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Durum güncellenemedi");
    }
  }, [user?._id]);

  // Sipariş kabul et
  const handleAcceptOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/accept`);
      await updateCourierStatus('busy');
      toast.success('Sipariş kabul edildi!');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Sipariş kabul edilemedi');
    }
  };

  // Siparişleri getir
  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders');
      const ordersData = data?.orders || (Array.isArray(data) ? data : []);
      setOrders(ordersData);
    } catch (error) {
      console.error('Orders fetch error:', error);
      if (error.response?.status !== 401) {
        toast.error('Siparişler yüklenemedi');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kazanç getir
  const fetchEarnings = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await api.get(`/couriers/${user._id}/earnings`);
      setEarnings(data);
    } catch (error) {
      console.error('Earnings fetch error:', error);
    }
  }, [user?._id]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const availableOrders = safeOrders.filter(o => o.status === 'pending');
  const myOrders = safeOrders.filter(o =>
    o.courier_id === user?._id &&
    o.status !== 'delivered' &&
    o.status !== 'cancelled'
  );

  const getStatusBadge = (status) => {
    const variants = {
      pending: { label: 'Bekliyor', className: 'bg-amber-100 text-amber-800 border-amber-200' },
      assigned: { label: 'Atandı', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      picked_up: { label: 'Alındı', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      in_transit: { label: 'Yolda', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      delivered: { label: 'Teslim Edildi', className: 'bg-green-100 text-green-800 border-green-200' },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className} variant="outline">{variant.label}</Badge>;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchOrders();
    fetchEarnings();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [user, fetchOrders, fetchEarnings, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white border-b border-border/40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-primary flex items-center justify-center">
                <Motorcycle size={24} weight="bold" className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">getir-heri</h1>
                <p className="text-xs text-muted-foreground">{user?.name || 'Kurye'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <SignOut size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Durumunuz</div>
              <Select value={courierStatus} onValueChange={updateCourierStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">🟢 Müsaitim</SelectItem>
                  <SelectItem value="busy">🟡 Meşgulüm</SelectItem>
                  <SelectItem value="offline">🔴 Çevrim Dışı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {earnings && (
        <div className="px-4 pb-2">
          <Card className="border-border/40 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Toplam Kazanç</p>
                  <p className="text-3xl font-bold mt-1">₺{earnings.total_earnings?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{earnings.total_deliveries || 0} teslimat</p>
                </div>
                <div className="h-14 w-14 rounded-sm bg-primary flex items-center justify-center">
                  <CurrencyDollar size={32} weight="bold" className="text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="px-4 mb-4">
        <div className="flex gap-2 border-b border-border/40">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === 'available' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Müsait Siparişler ({availableOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('my-orders')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === 'my-orders' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Siparişlerim ({myOrders.length})
          </button>
        </div>
      </div>

      <div className="px-4 pb-24 space-y-4">
        {activeTab === 'available' ? (
          availableOrders.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="p-8 text-center">
                <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Müsait sipariş bulunmuyor</p>
              </CardContent>
            </Card>
          ) : (
            availableOrders.map((order) => (
              <Card key={order._id || order.id} className="border-border/40 hover:shadow-sm transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{order.restaurant_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{order.customer_address}</p>
                    </div>
                    {getStatusBadge(order.status)}
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
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <div>
                      <p className="text-xs text-muted-foreground">Teslimat Ücreti</p>
                      <p className="text-lg font-bold text-primary">₺{order.delivery_fee?.toFixed(2) || '0.00'}</p>
                    </div>
                    <Button onClick={() => handleAcceptOrder(order._id || order.id)} className="bg-primary hover:bg-primary/90">
                      Kabul Et
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : (
          myOrders.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="p-8 text-center">
                <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aktif siparişiniz bulunmuyor</p>
              </CardContent>
            </Card>
          ) : (
            myOrders.map((order) => (
              <Card
                key={order._id || order.id}
                className="border-border/40 hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                onClick={() => navigate(`/courier/orders/${order._id || order.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{order.restaurant_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{order.customer_address}</p>
                    </div>
                    {getStatusBadge(order.status)}
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
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <div>
                      <p className="text-xs text-muted-foreground">Teslimat Ücreti</p>
                      <p className="text-lg font-bold text-primary">₺{order.delivery_fee?.toFixed(2) || '0.00'}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Detayları Gör →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/40 z-50">
        <div className="flex items-center justify-around px-4 py-3">
          <button onClick={() => navigate('/courier/dashboard')} className="flex flex-col items-center gap-1 text-primary">
            <Package size={24} weight="bold" />
            <span className="text-xs font-medium">Siparişler</span>
          </button>
          <button onClick={() => navigate('/courier/history')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <ClockCounterClockwise size={24} />
            <span className="text-xs">Geçmiş</span>
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
