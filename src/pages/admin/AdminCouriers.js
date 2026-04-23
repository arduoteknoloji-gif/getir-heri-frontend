import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import api from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';

export default function AdminCouriers() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/couriers');
      setCouriers(response.data);
    } catch (error) {
      console.error('Kuryeler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courierId) => {
    try {
      await api.post(`/admin/couriers/${courierId}/approve`);
      fetchCouriers();
    } catch (error) {
      console.error('Onaylama hatası:', error);
    }
  };

  const handleReject = async (courierId) => {
    try {
      await api.post(`/admin/couriers/${courierId}/reject`);
      fetchCouriers();
    } catch (error) {
      console.error('Reddetme hatası:', error);
    }
  };

  const filteredCouriers = couriers.filter(courier => {
    const matchesSearch = courier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courier.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || courier.status === statusFilter;
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
            <h1 className="text-3xl font-bold text-gray-900">Kuryeler</h1>
            <p className="text-gray-600 mt-1">Teslimat personelini yönetin</p>
          </div>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Kurye Ekle
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kurye ara..."
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
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Kuryeler yükleniyor...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Kurye</th>
                      <th className="text-left py-3 px-4">İletişim</th>
                      <th className="text-left py-3 px-4">Konum</th>
                      <th className="text-left py-3 px-4">Puan</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCouriers.map((courier) => (
                      <tr key={courier._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {courier.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{courier.name}</p>
                              <p className="text-sm text-gray-500">ID: {courier._id?.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {courier.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {courier.phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {courier.city || 'Belirtilmemiş'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{courier.rating || '4.5'}</span>
                            <span className="text-sm text-gray-500">({courier.totalDeliveries || 0})</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusBadge(courier.status)}>
                            {courier.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {courier.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:bg-green-50"
                                  onClick={() => handleApprove(courier._id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(courier._id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              Görüntüle
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCouriers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Kriterlere uygun kurye bulunamadı.
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