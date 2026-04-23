import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, CurrencyDollar, Package, TrendUp, ClockCounterClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function CourierEarnings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get(`/couriers/${user._id}/earnings`);
      // GÜVENLİK: data kontrolü
      setEarnings(data?.data || data || null);
    } catch (error) {
      console.error('Earnings fetch error:', error);
      toast.error('Kazançlar yüklenemedi');
      setEarnings(null);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-border/40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/courier/dashboard')}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Kazançlarım</h1>
              <p className="text-xs text-muted-foreground">Finansal özet</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="border-border/40 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Toplam Kazanç</p>
                <p className="text-4xl font-bold mt-2">₺{earnings?.total_earnings?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-muted-foreground mt-1">{earnings?.total_deliveries || 0} teslimat</p>
              </div>
              <div className="h-16 w-16 rounded-sm bg-primary flex items-center justify-center">
                <CurrencyDollar size={36} weight="bold" className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Teslimat</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{earnings?.total_deliveries || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendUp size={18} className="text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ortalama</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₺{earnings?.average_per_delivery?.toFixed(2) || '0.00'}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/40 bg-secondary/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Kazançlarınız her teslimat sonrası otomatik olarak hesaplanır.<br />
              Ödeme detayları için yönetici ile iletişime geçin.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/40 z-50">
        <div className="flex items-center justify-around px-4 py-3">
          <button onClick={() => navigate('/courier/dashboard')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <Package size={24} />
            <span className="text-xs">Siparişler</span>
          </button>
          <button onClick={() => navigate('/courier/history')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <ClockCounterClockwise size={24} />
            <span className="text-xs">Geçmiş</span>
          </button>
          <button onClick={() => navigate('/courier/earnings')} className="flex flex-col items-center gap-1 text-primary">
            <CurrencyDollar size={24} weight="bold" />
            <span className="text-xs font-medium">Kazançlar</span>
          </button>
        </div>
      </div>
    </div>
  );
}