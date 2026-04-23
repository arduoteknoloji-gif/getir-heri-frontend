import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../api';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockKeyIcon,
  PhoneIcon,
  StorefrontIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon
} from '@phosphor-icons/react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    restaurantName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    // Backend'in beklediği formatta veri hazırla
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role,
      // Sadece restaurant rolü için gönder
      ...(formData.role === 'restaurant' && { 
        restaurant_name: formData.restaurantName.trim() 
      })
    };

    try {
      const response = await api.post('/auth/register', payload);
      
      // Backend yanıtını kontrol et
      const data = response.data;
      
      if (data.success && data.token) {
        // Başarılı kayıt
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Role göre yönlendirme
        const userRole = data.user?.role || data.role;
        
        switch (userRole) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'courier':
            navigate('/courier/dashboard');
            break;
          case 'restaurant':
            navigate('/restaurant/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        // Başarısız yanıt (success: false veya token yok)
        setError(data.message || 'Kayıt başarısız');
      }
      
    } catch (err) {
      console.error('Kayıt hatası:', err);
      
      const errorData = err.response?.data;
      let errorMessage = 'Kayıt başarısız';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Hesap Oluştur
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Bugün Getir-Heri'ye katılın
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <p className="font-medium">Hata:</p>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adınızı girin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="E-postanızı girin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Telefon numaranızı girin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hesap Türü
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'customer'})}
                  className={`p-3 text-center border rounded-lg ${
                    formData.role === 'customer' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserIcon className="mx-auto h-5 w-5 mb-1" />
                  <span className="text-sm">Müşteri</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'courier'})}
                  className={`p-3 text-center border rounded-lg ${
                    formData.role === 'courier' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <StorefrontIcon className="mx-auto h-5 w-5 mb-1" />
                  <span className="text-sm">Kurye</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'restaurant'})}
                  className={`p-3 text-center border rounded-lg ${
                    formData.role === 'restaurant' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <StorefrontIcon className="mx-auto h-5 w-5 mb-1" />
                  <span className="text-sm">Restoran</span>
                </button>
              </div>
            </div>

            {formData.role === 'restaurant' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restoran Adı
                </label>
                <div className="relative">
                  <StorefrontIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required={formData.role === 'restaurant'}
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Restoran adını girin"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <LockKeyIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Şifre oluşturun (en az 6 karakter)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifreyi Onayla
              </label>
              <div className="relative">
                <LockKeyIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
            <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Giriş yap
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}