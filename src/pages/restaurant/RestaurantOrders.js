import React, { useState, useEffect, useCallback } from 'react';
import { RestaurantLayout } from '../../components/RestaurantLayout';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { MapPin, Eye } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { RouteMap } from '../../components/MapComponents';

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders');
      // Backend { orders: [...] } formatında dönüyor
      const ordersData = data?.orders || (Array.isArray(data) ? data : []);
      setOrders(ordersData);
    } catch (error) {
      console.error('Orders fetch error:', error);
      toast.error('Siparişler yüklenemedi');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: { label: 'Bekliyor', className: 'bg-amber-100 text-amber-800' },
      assigned: { label: 'Atandı', className: 'bg-blue-100 text-blue-800' },
      picked_up: { label: 'Alındı', className: 'bg-purple-100 text-purple-800' },
      in_transit: { label: 'Yolda', className: 'bg-indigo-100 text-indigo-800' },
      delivered: { label: 'Teslim Edildi', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'İptal', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <RestaurantLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Siparişler</h2>
          <p className="text-sm text-muted-foreground mt-1">Tüm siparişlerinizi görüntüleyin</p>
        </div>

        <Card className="border-border/40">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş ID</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead>Kurye</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Henüz sipariş yok
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order._id || order.id}>
                        <TableCell className="font-mono text-xs">#{(order.id || order._id)?.slice(0, 8)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground line-clamp-2">
                              {order.customer_address}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.courier_name ? (
                            <span className="text-sm">{order.courier_name}</span>
                          ) : (
                            <Badge variant="outline" className="text-xs">Atanmadı</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">₺{order.total_amount?.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('tr-TR', {
                            day: '2-digit', month: '2-digit', year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {(order.status === 'assigned' || order.status === 'picked_up' || order.status === 'in_transit') &&
                            order.courier_name && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setTrackingDialogOpen(true);
                                }}
                              >
                                <Eye size={16} className="mr-1" />
                                Takip Et
                              </Button>
                            )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Canlı Sipariş Takibi</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sipariş ID</p>
                  <p className="font-mono">#{(selectedOrder.id || selectedOrder._id)?.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kurye</p>
                  <p className="font-medium">{selectedOrder.courier_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Müşteri</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Durum</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              <div className="border border-border/40 rounded-sm overflow-hidden">
                <RouteMap
                  pickup={{ lat: selectedOrder.pickup_lat, lng: selectedOrder.pickup_lng }}
                  delivery={{ lat: selectedOrder.customer_lat, lng: selectedOrder.customer_lng }}
                  courierLocation={
                    selectedOrder.courier_lat && selectedOrder.courier_lng
                      ? { lat: selectedOrder.courier_lat, lng: selectedOrder.courier_lng }
                      : null
                  }
                  height="450px"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </RestaurantLayout>
  );
}
