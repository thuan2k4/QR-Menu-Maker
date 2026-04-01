import React, { useState, useEffect, ReactNode } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Restaurant, UserProfile } from '../types';
import { 
  LayoutDashboard, 
  Settings, 
  Menu as MenuIcon, 
  LogOut, 
  QrCode, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

// Sub-components
import Overview from './dashboard/Overview';
import RestaurantSettings from './dashboard/RestaurantSettings';
import MenuManagement from './dashboard/MenuManagement';

interface DashboardProps {
  user: User;
  profile: UserProfile | null;
}

export default function Dashboard({ user, profile }: DashboardProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const q = query(collection(db, 'restaurants'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setRestaurant({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Restaurant);
      } else {
        setRestaurant(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2 border-b border-gray-50">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <QrCode className="text-white w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight">QR Menu Maker</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Tổng quan" active={location.pathname === '/dashboard'} />
          <SidebarLink to="/dashboard/menu" icon={<MenuIcon size={20} />} label="Quản lý Menu" active={location.pathname.startsWith('/dashboard/menu')} />
          <SidebarLink to="/dashboard/settings" icon={<Settings size={20} />} label="Cài đặt" active={location.pathname === '/dashboard/settings'} />
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Dashboard</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">
              {location.pathname === '/dashboard' ? 'Tổng quan' : 
               location.pathname.includes('/menu') ? 'Quản lý Menu' : 'Cài đặt'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {restaurant && (
              <a 
                href={`/m/${restaurant.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-full transition-all"
              >
                Xem Menu <ExternalLink size={14} />
              </a>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{user.displayName}</p>
                <p className="text-xs text-gray-400 mt-1">{user.email}</p>
              </div>
              <img src={user.photoURL || ''} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-100" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto w-full">
          <Routes>
            <Route index element={<Overview user={user} restaurant={restaurant} />} />
            <Route path="menu" element={<MenuManagement user={user} restaurant={restaurant} />} />
            <Route path="settings" element={<RestaurantSettings user={user} restaurant={restaurant} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, label, active }: { to: string, icon: ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
