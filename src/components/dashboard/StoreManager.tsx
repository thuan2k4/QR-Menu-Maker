import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Store } from '../../types';
import { User } from 'firebase/auth';
import {
  Info,
  QrCode,
  Menu as MenuIcon,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';

// Components
import Overview from './Overview';
import RestaurantSettings from './RestaurantSettings';
import MenuManagement from './MenuManagement';

interface StoreManagerProps {
  user: User;
}

export default function StoreManager({ user }: StoreManagerProps) {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const unsubscribe = onSnapshot(doc(db, 'restaurants', id), (doc) => {
        if (doc.exists()) {
          setStore({ id: doc.id, ...doc.data() } as Store);
        } else {
          navigate('/dashboard');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  if (!store) return null;

  const tabs = [
    { id: 'overview', label: 'Mã QR', icon: <QrCode size={18} />, path: `/dashboard/store/${id}` },
    { id: 'menu', label: 'Quản lý Menu', icon: <MenuIcon size={18} />, path: `/dashboard/store/${id}/menu` },
    { id: 'settings', label: 'Thông tin cửa hàng', icon: <Info size={18} />, path: `/dashboard/store/${id}/settings` },
  ];

  const activeTab = location.pathname.endsWith('/settings') ? 'settings' :
    location.pathname.endsWith('/menu') ? 'menu' : 'overview';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>/m/{store.slug}</span>
              <a href={`/m/${store.slug}`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline flex items-center gap-1">
                Xem Menu <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="pt-4">
        <Routes>
          <Route index element={<Overview user={user} store={store} />} />
          <Route path="menu" element={<MenuManagement user={user} store={store} />} />
          <Route path="settings" element={<RestaurantSettings user={user} restaurant={store} />} />
        </Routes>
      </div>
    </div>
  );
}
