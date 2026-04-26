import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantLayout } from '../../components/RestaurantLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { toast } from 'sonner';

export default function RestaurantNewOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    customer_lat: 41.0082,
    customer_lng: 28.9784,
    items: [{ name: '', quantity: 1, price: 0 }],
    total_amount: 0,
    delivery_fee: 40,
    notes: '',
    payment_method: formData.payment_method,
  });

  // DÜZELTME: restaurant_id user._id'den alınır
  const restaurantId = user?._id || user?.id;

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleItemChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index][field] = field === 'price' || field === 'quantity'
        ? parseFloat(value) || 0
        : value;

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return { ...prev, items: newItems, total_amount: total };
    });
  }, []);

  const addItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }]
    }));
  }, []);

  const removeItem = useCallback((index) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...prev, items: newItems, total_amount: total };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // DÜZELTME: restaurantId kontrolü
    if (!restaurantId) {
      toast.error('Restoran kimliği bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    if (formData.items.length === 0 || formData.items.some(item => !item.name)) {
      toast.error('En az bir ürün eklemelisiniz');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        customer_latitude: formData.customer_lat,
        customer_longitude: formData.customer_lng,
        items: formData.items,
        total_amount: formData.total_amount,
        notes: formData.notes
        payment_method: formData.payment_method
      };

      await api.post('/orders', payload);

      toast.success('Sipariş başarıyla oluşturuldu!');
      navigate('/restaurant/orders');
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        toast.error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      } else if (error.response?.status === 403) {
        toast.error('Bu işlemi yapmaya yetkiniz yok.');
      } else {
        toast.error(error.response?.data?.detail || 'Sipariş oluşturulamadı');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RestaurantLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Yeni Sipariş Oluştur</h2>
          <p className="text-sm text-muted-foreground mt-1">Teslimat siparişi oluşturun</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Müşteri Bilgileri */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Soyad</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => handleChange('customer_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => handleChange('customer_phone', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Teslimat Adresi</Label>
                <Textarea
                  value={formData.customer_address}
                  onChange={(e) => handleChange('customer_address', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Ürünler */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ürünler</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  + Ürün Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Ürün Adı</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Adet</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Fiyat (₺)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      required
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-border/40">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Toplam:</span>
                  <span>₺{formData.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-muted-foreground">Teslimat Ücreti</span>
                  <span className="font-medium">₺{formData.delivery_fee.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ödeme Yöntemi */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Ödeme Yöntemi</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.payment_method}
                onValueChange={(value) => handleChange('payment_method', value)}
              >
                <div className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value="cash_on_delivery" id="cash" />
                  <Label htmlFor="cash">Kapıda Nakit</Label>
                </div>
                <div className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value="card_on_delivery" id="card" />
                  <Label htmlFor="card">Kapıda Kredi Kartı</Label>
                </div>
                <div className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online">Online Ödeme</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Notlar */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Notlar (Opsiyonel)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Ekstra notlar..."
              />
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/restaurant/orders')}
              className="flex-1"
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Oluşturuluyor...' : 'Sipariş Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </RestaurantLayout>
  );
}