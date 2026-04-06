import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Store } from '../../types';
import { User } from 'firebase/auth';
import { getMenuTemplateById } from '../../constants/menuTemplates';
import {
  Info,
  QrCode,
  Menu as MenuIcon,
  ChevronLeft,
  ExternalLink,
  Palette
} from 'lucide-react';

// Components
import Overview from './Overview';
import RestaurantSettings from './RestaurantSettings';
import MenuManagement from './MenuManagement';
import ThemeEditor from './ThemeEditor';

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

  const currentVisibility = store.menuVisibility || 'private';
  const isOwner = user.uid === store.ownerId;
  const storeCurrency = store.currency || 'VND';
  const storeSizePreset = store.sizePreset || 'normal';
  const storeFontFamily = store.fontFamily || 'Inter';
  const storePrimaryColor = store.primaryColor || store.themeColor || '#f97316';
  const selectedTemplate = getMenuTemplateById(store.templateId);

  const handleVisibilityToggle = async () => {
    if (!isOwner) return;
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
    try {
      await updateDoc(doc(db, 'restaurants', store.id), { menuVisibility: newVisibility, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Không thể cập nhật trạng thái menu:', error);
      alert('Không thể cập nhật trạng thái menu. Vui lòng thử lại.');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Mã QR', icon: <QrCode size={18} />, path: `/dashboard/store/${id}` },
    { id: 'menu', label: 'Quản lý Menu', icon: <MenuIcon size={18} />, path: `/dashboard/store/${id}/menu` },
    { id: 'theme', label: 'Giao diện', icon: <Palette size={18} />, path: `/dashboard/store/${id}/theme` },
    { id: 'settings', label: 'Thông tin cửa hàng', icon: <Info size={18} />, path: `/dashboard/store/${id}/settings` },
  ];

  const activeTab = location.pathname.endsWith('/settings') ? 'settings' :
    location.pathname.endsWith('/theme') ? 'theme' :
      location.pathname.endsWith('/menu') ? 'menu' : 'overview';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/stores" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-400" aria-label="Quay lại danh sách cửa hàng">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>/m/{store.slug}</span>
              <a href={`/m/${store.slug}`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-orange-300 rounded-md">
                Xem Menu <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentVisibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {currentVisibility === 'public' ? 'Công khai' : 'Riêng tư'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700" style={{ border: `1px solid ${storePrimaryColor}` }}>
            {storeCurrency}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
            {storeSizePreset}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700">
            {storeFontFamily}
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${selectedTemplate.primaryColor}18`, color: selectedTemplate.primaryColor }}
            title={selectedTemplate.description}
          >
            {selectedTemplate.name}
          </span>
          <Link
            to={`/dashboard/store/${id}/theme`}
            className="inline-flex min-h-[44px] items-center px-3 py-1 rounded-full text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            Đổi template
          </Link>
          <button
            type="button"
            onClick={handleVisibilityToggle}
            disabled={!isOwner}
            className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold transition-all focus-visible:ring-2 focus-visible:ring-orange-300 ${isOwner ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            {currentVisibility === 'public' ? 'Chuyển về Private' : 'Chuyển Public'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex min-h-[44px] items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-orange-300 ${activeTab === tab.id
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
          <Route path="theme" element={<ThemeEditor user={user} restaurant={store} />} />
          <Route path="settings" element={<RestaurantSettings user={user} restaurant={store} />} />
        </Routes>
      </div>
    </div>
  );
}
