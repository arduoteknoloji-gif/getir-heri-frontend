import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Erişim Kısıtlı
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Sisteme kayıt sadece yönetici tarafından yapılabilir.
          </p>
          <p className="text-gray-500 text-sm">
            Hesap oluşturmak için lütfen yöneticinizle iletişime geçin.
          </p>
          <Link to="/login">
            <Button className="w-full mt-4">Giriş Sayfasına Dön</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
