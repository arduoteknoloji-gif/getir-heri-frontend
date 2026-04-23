import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Store, 
  Search, 
  Plus,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Restoranlar alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (restaurantId) => {
    try {
      await api.post(`/admin/restaurants/${restaurantId}/approve`);
      fetchRestaurants();
    } catch (error) {
      console.error('Onaylama hatası:', error);
    }
  };

  const handleReject = async (restaurantId) => {
    try {
      await api.post(`/admin/restaurants/${restaurantId}/reject`);
      fetchRestaurants();
    } catch (error) {
      console.error('Reddetme hatası:', error);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restoranlar</h1>
            <p className="text-gray-600 mt-1">Restoran ortaklarını yönetin</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Restoran Ekle
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Restoran ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="pending">Beklemede</option>
                  <option value="inactive">Pasif</option>
                  <option value="rejected">Reddedildi</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Restoranlar yükleniyor...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Restoran</th>
                      <th className="text-left py-3 px-4">İletişim</th>
                      <th className="text-left py-3 px-4">Konum</th>
                      <th className="text-left py-3 px-4">Puan</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRestaurants.map((restaurant) => (
                      <tr key={restaurant._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <Store className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium">{restaurant.name}</p>
                              <p className="text-sm text-gray-500">{restaurant.cuisine || 'Genel'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {restaurant.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {restaurant.phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {restaurant.address || 'Belirtilmemiş'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{restaurant.rating || '4.5'}</span>
                            <span className="text-sm text-gray-500">({restaurant.reviewCount || 0})</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusBadge(restaurant.status)}>
                            {restaurant.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {restaurant.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:bg-green-50"
                                  onClick={() => handleApprove(restaurant._id)}
                                >
                                  Onayla
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(restaurant._id)}
                                >
                                  Reddet
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRestaurants.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Kriterlere uygun restoran bulunamadı.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}