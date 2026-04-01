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
import DashboardOverview from './dashboard/DashboardOverview';
import RestaurantSettings from './dashboard/RestaurantSettings';
import MenuManagement from './dashboard/MenuManagement';

interface DashboardProps {
  user: User;
  profile: UserProfile | null;
}

import StoreList from './dashboard/StoreList';
import StoreManager from './dashboard/StoreManager';

export default function Dashboard({ user, profile }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const isStoresPage = location.pathname.startsWith('/dashboard/stores');
  const isStoreDetailPage = location.pathname.startsWith('/dashboard/store/');
  const isDashboardOverview = location.pathname === '/dashboard';

  return (
    <div className="flex min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2 border-b border-gray-50">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <QrCode className="text-white w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight">QR Menu Maker</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isDashboardOverview} />
          <SidebarLink to="/dashboard/stores" icon={<MenuIcon size={20} />} label="Cửa hàng của tôi" active={isStoresPage || isStoreDetailPage} />
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

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex md:hidden items-center justify-around p-2 z-50">
        <MobileNavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isDashboardOverview} />
        <MobileNavLink to="/dashboard/stores" icon={<MenuIcon size={20} />} label="Cửa hàng" active={isStoresPage || isStoreDetailPage} />
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-gray-400">
          <LogOut size={20} />
          <span className="text-[10px] font-bold">Thoát</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-400 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Dashboard</span>
              <ChevronRight size={14} className="hidden sm:inline" />
              <span className="text-gray-900 font-medium truncate">
                {isDashboardOverview ? 'Tổng quan' : 
                 isStoresPage ? 'Cửa hàng của tôi' : 
                 isStoreDetailPage ? 'Quản lý cửa hàng' : 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <img src={user.photoURL || ''} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-100" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Routes>
            <Route index element={<DashboardOverview user={user} />} />
            <Route path="stores" element={<StoreList user={user} />} />
            <Route path="store/:id/*" element={<StoreManager user={user} />} />
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

function MobileNavLink({ to, icon, label, active }: { to: string, icon: ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 p-2 transition-all ${
        active ? 'text-orange-500' : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}
