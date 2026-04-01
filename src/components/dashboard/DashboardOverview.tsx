import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Store, Utensils, LayoutList, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface DashboardOverviewProps {
  user: User;
}

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    stores: 0,
    categories: 0,
    products: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const storesQuery = query(collection(db, 'restaurants'), where('ownerId', '==', user.uid));
        const storesSnap = await getDocs(storesQuery);
        const storeIds = storesSnap.docs.map(doc => doc.id);

        let totalCategories = 0;
        let totalProducts = 0;

        if (storeIds.length > 0) {
          // Firestore 'in' query has a limit of 10, but for MVP this is fine
          // For more stores, we'd need multiple queries or a different approach
          const limitedStoreIds = storeIds.slice(0, 10);

          const catQuery = query(collection(db, 'categories'), where('restaurantId', 'in', limitedStoreIds));
          const prodQuery = query(collection(db, 'products'), where('restaurantId', 'in', limitedStoreIds));

          const [catSnap, prodSnap] = await Promise.all([
            getDocs(catQuery),
            getDocs(prodQuery)
          ]);

          totalCategories = catSnap.size;
          totalProducts = prodSnap.size;
        }

        setStats({
          stores: storesSnap.size,
          categories: totalCategories,
          products: totalProducts,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user.uid]);

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan Dashboard</h1>
          <p className="text-gray-500 mt-1">Chào mừng quay trở lại, {user.displayName || 'User'}!</p>
        </div>
        <Link
          to="/dashboard/stores"
          className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
        >
          <Plus size={20} />
          Thêm cửa hàng mới
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Store className="text-orange-500" />}
          label="Tổng cửa hàng"
          value={stats.stores}
          color="bg-orange-50"
        />
        <StatCard
          icon={<LayoutList className="text-blue-500" />}
          label="Tổng danh mục"
          value={stats.categories}
          color="bg-blue-50"
        />
        <StatCard
          icon={<Utensils className="text-green-500" />}
          label="Tổng sản phẩm"
          value={stats.products}
          color="bg-green-50"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
    >
      <div className={`${color} p-4 rounded-2xl`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
}

function QuickActionLink({ to, title, description }: { to: string, title: string, description: string }) {
  return (
    <Link
      to={to}
      className="group p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{title}</h4>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </Link>
  );
}
