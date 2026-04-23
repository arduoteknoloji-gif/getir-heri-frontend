import React from 'react';

// Google Maps API anahtarı kontrolü
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// API anahtarı yoksa harita yerine basit bir mesaj göster
export const MapContainer = ({ children, center, zoom }) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <p className="font-medium">Harita görünümü</p>
          <p className="text-sm mt-1">Google Maps API anahtarı gerekli</p>
          <p className="text-xs mt-2 text-gray-400">
            .env dosyasına REACT_APP_GOOGLE_MAPS_API_KEY ekleyin
          </p>
        </div>
      </div>
    );
  }

  // API anahtarı varsa gerçek haritayı yükle
  return (
    <div className="w-full h-64 bg-gray-50 rounded-lg overflow-hidden">
      {/* Burada gerçek Google Maps veya alternatif harita entegrasyonu olacak */}
      {children}
    </div>
  );
};

// Kurye konumunu gösteren basit marker
export const CourierMarker = ({ position, status }) => {
  const statusColors = {
    available: 'bg-green-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-500'
  };

  return (
    <div className={`w-4 h-4 rounded-full ${statusColors[status] || 'bg-blue-500'} border-2 border-white shadow-lg`} 
         title={`Durum: ${status}`} />
  );
};

// Restoran konum marker'ı
export const RestaurantMarker = ({ name }) => (
  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
    {name}
  </div>
);

// Sipariş rotası çizgisi (basit görsel)
export const OrderRoute = ({ from, to }) => (
  <div className="relative w-full h-1 bg-gray-200 rounded overflow-hidden">
    <div className="absolute inset-y-0 left-0 bg-blue-500 w-2/3 rounded" />
  </div>
);

// RouteMap bileşeni - CourierOrderDetail için
export const RouteMap = ({ pickup, delivery, courierLocation, height }) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
        style={{ height: height || '300px' }}
      >
        <div className="text-center text-gray-500 p-4">
          <p className="font-medium">Canlı Takip</p>
          <p className="text-sm mt-1">Google Maps API anahtarı gerekli</p>
          <div className="mt-4 space-y-2 text-xs text-left">
            {pickup && (
              <p>📍 Alış: {pickup.lat?.toFixed(4)}, {pickup.lng?.toFixed(4)}</p>
            )}
            {delivery && (
              <p>🏠 Teslimat: {delivery.lat?.toFixed(4)}, {delivery.lng?.toFixed(4)}</p>
            )}
            {courierLocation && (
              <p>🛵 Kurye: {courierLocation.lat?.toFixed(4)}, {courierLocation.lng?.toFixed(4)}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full bg-gray-50 rounded-lg overflow-hidden relative"
      style={{ height: height || '300px' }}
    >
      {/* Gerçek harita entegrasyonu buraya gelecek */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-gray-400">Harita yükleniyor...</p>
      </div>
    </div>
  );
};

export default MapContainer;