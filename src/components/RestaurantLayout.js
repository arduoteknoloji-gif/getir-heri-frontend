import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { ChartBar, Package, Plus, Storefront, SignOut } from '@phosphor-icons/react';

export function RestaurantLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/restaurant/dashboard', label: 'Dashboard', icon: ChartBar },
    { path: '/restaurant/orders', label: 'Siparişler', icon: Package },
    { path: '/restaurant/orders/new', label: 'Yeni Sipariş', icon: Plus },
    { path: '/restaurant/analytics', label: 'Analitik', icon: ChartBar },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-border/40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-primary flex items-center justify-center">
                <Storefront size={24} weight="bold" className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">getir-heri</h1>
                <p className="text-xs text-muted-foreground">{user?.restaurant_name || 'Restoran Paneli'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <SignOut size={18} className="mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-border/40 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon size={20} weight={isActive ? 'bold' : 'regular'} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}