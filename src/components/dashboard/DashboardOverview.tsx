import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Store, Utensils, LayoutList, Plus, Eye, MousePointerClick } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardOverviewProps {
  user: User;
}

type TopStoreMetric = {
  id: string;
  name: string;
  menuViews: number;
  productDetailClicks: number;
};

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  const [stats, setStats] = useState({
    stores: 0,
    categories: 0,
    products: 0,
    menuViews: 0,
    productDetailClicks: 0,
    topStores: [] as TopStoreMetric[],
    loading: true
  });

  const getEventDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate();
    }
    return null;
  };

  useEffect(() => {
    let unsubscribeAnalytics: (() => void) | null = null;

    const setupStats = async () => {
      try {
        const storesQuery = query(collection(db, 'restaurants'), where('ownerId', '==', user.uid));
        const storesSnap = await getDocs(storesQuery);
        const storeIds = storesSnap.docs.map(doc => doc.id);
        const storesMeta = storesSnap.docs.map(doc => ({ id: doc.id, name: String(doc.data().name || 'Cửa hàng chưa đặt tên') }));

        let totalCategories = 0;
        let totalProducts = 0;

        if (storeIds.length > 0) {
          // Process storeIds in batches of 10 for Firestore 'in' query
          const batchSize = 10;
          const storeBatches: string[][] = [];
          for (let i = 0; i < storeIds.length; i += batchSize) {
            storeBatches.push(storeIds.slice(i, i + batchSize));
          }

          const catQueries = storeBatches.map(batch => 
            getDocs(query(collection(db, 'categories'), where('restaurantId', 'in', batch)))
          );
          const prodQueries = storeBatches.map(batch => 
            getDocs(query(collection(db, 'products'), where('restaurantId', 'in', batch)))
          );

          const catSnaps = await Promise.all(catQueries);
          const prodSnaps = await Promise.all(prodQueries);

          totalCategories = catSnaps.reduce((acc, snap) => acc + snap.size, 0);
          totalProducts = prodSnaps.reduce((acc, snap) => acc + snap.size, 0);

          // For analytics snapshots, we focus on the first 10 for performance in overview
          // In a real production app, we would use a more scalable analytics solution
          const analyticsQuery = query(collection(db, 'analytics'), where('storeId', 'in', storeBatches[0]));
          unsubscribeAnalytics = onSnapshot(analyticsQuery, (analyticsSnap) => {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - timeRange);

            const storeMetricsMap = new Map<string, { menuViews: number; productDetailClicks: number }>();
            storesMeta.forEach((storeMeta) => {
              storeMetricsMap.set(storeMeta.id, { menuViews: 0, productDetailClicks: 0 });
            });

            analyticsSnap.docs.forEach((eventDoc) => {
              const data = eventDoc.data();
              const eventDate = getEventDate(data.timestamp);
              if (!eventDate || eventDate < cutoffDate) return;

              const metric = storeMetricsMap.get(data.storeId);
              if (!metric) return;

              if (data.type === 'menu_view') {
                metric.menuViews += 1;
              }
              if (data.type === 'product_detail_click') {
                metric.productDetailClicks += 1;
              }
            });

            const topStoresMetrics: TopStoreMetric[] = storesMeta.map((storeMeta) => {
              const metric = storeMetricsMap.get(storeMeta.id) || { menuViews: 0, productDetailClicks: 0 };
              return {
                id: storeMeta.id,
                name: storeMeta.name,
                menuViews: metric.menuViews,
                productDetailClicks: metric.productDetailClicks,
              };
            });

            const totalMenuViews = topStoresMetrics.reduce((sum, item) => sum + item.menuViews, 0);
            const totalProductDetailClicks = topStoresMetrics.reduce((sum, item) => sum + item.productDetailClicks, 0);

            setStats((prev) => ({
              ...prev,
              menuViews: totalMenuViews,
              productDetailClicks: totalProductDetailClicks,
              topStores: topStoresMetrics.sort((a, b) => b.menuViews - a.menuViews).slice(0, 5),
            }));
          });
        }

        setStats({
          stores: storesSnap.size,
          categories: totalCategories,
          products: totalProducts,
          menuViews: 0,
          productDetailClicks: 0,
          topStores: [],
          loading: false
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    setupStats();

    return () => {
      unsubscribeAnalytics?.();
    };
  }, [user.uid, timeRange]);

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
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan Dashboard</h1>
          <p className="text-gray-500 mt-1">Chào mừng quay trở lại, {user.displayName || 'User'}!</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1" role="group" aria-label="Chọn khoảng thời gian analytics">
            <button
              type="button"
              onClick={() => setTimeRange(7)}
              aria-pressed={timeRange === 7}
              className={`min-h-[44px] px-3 py-2 text-xs font-bold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-orange-400 ${timeRange === 7 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              7 ngày
            </button>
            <button
              type="button"
              onClick={() => setTimeRange(30)}
              aria-pressed={timeRange === 30}
              className={`min-h-[44px] px-3 py-2 text-xs font-bold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-orange-400 ${timeRange === 30 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              30 ngày
            </button>
          </div>
          <Link
            to="/dashboard/stores"
            className="inline-flex min-h-[44px] items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <Plus size={20} />
            Thêm cửa hàng mới
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-min">
        <StatCard
          icon={<Store className="text-orange-500" size={16} />}
          label="Tổng cửa hàng"
          value={stats.stores}
        />
        <StatCard
          icon={<LayoutList className="text-blue-500" size={16} />}
          label="Tổng danh mục"
          value={stats.categories}
        />
        <StatCard
          icon={<Utensils className="text-green-500" size={16} />}
          label="Tổng sản phẩm"
          value={stats.products}
        />
        <StatCard
          icon={<Eye className="text-emerald-500" size={16} />}
          label="Lượt xem menu"
          value={stats.menuViews}
        />
        <StatCard
          icon={<MousePointerClick className="text-teal-500" size={16} />}
          label="Click chi tiết"
          value={stats.productDetailClicks}
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <h3 className="text-lg font-bold text-gray-900">Top cửa hàng theo lượt xem Menu</h3>
          <p className="text-sm text-gray-500 mt-1">Dữ liệu trong {timeRange} ngày gần nhất.</p>
        </div>

        {stats.topStores.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">Chưa có dữ liệu analytics trong khoảng thời gian đã chọn.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-6 py-3">Cửa hàng</th>
                  <th className="text-left px-6 py-3">Lượt xem</th>
                  <th className="text-left px-6 py-3">Click chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {stats.topStores.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-700">{item.menuViews}</td>
                    <td className="px-6 py-4 text-gray-700">{item.productDetailClicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
