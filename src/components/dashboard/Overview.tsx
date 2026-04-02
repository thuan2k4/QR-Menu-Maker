import { QRCodeSVG } from 'qrcode.react';
import { User } from 'firebase/auth';
import { Store } from '../../types';
import { Download, ExternalLink, QrCode, Utensils, LayoutList, Eye, MousePointerClick } from 'lucide-react';
import React, { useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

interface OverviewProps {
  user: User;
  store: Store | null;
}

export default function Overview({ user, store }: OverviewProps) {
  const [stats, setStats] = useState({ categories: 0, products: 0 });
  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  const [analyticsStats, setAnalyticsStats] = useState({
    menuViews: 0,
    productDetailClicks: 0,
  });

  const getEventDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate();
    }
    return null;
  };

  useEffect(() => {
    if (store) {
      const fetchStats = async () => {
        const catQuery = query(collection(db, 'categories'), where('restaurantId', '==', store.id));
        const prodQuery = query(collection(db, 'products'), where('restaurantId', '==', store.id));
        const [catSnap, prodSnap] = await Promise.all([getDocs(catQuery), getDocs(prodQuery)]);
        setStats({ categories: catSnap.size, products: prodSnap.size });
      };
      fetchStats();
    }
  }, [store]);

  useEffect(() => {
    if (!store) return;

    const analyticsQuery = query(collection(db, 'analytics'), where('storeId', '==', store.id));
    const unsubscribe = onSnapshot(analyticsQuery, (analyticsSnap) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRange);

      let menuViews = 0;
      let productDetailClicks = 0;

      analyticsSnap.docs.forEach((eventDoc) => {
        const data = eventDoc.data();
        const eventDate = getEventDate(data.timestamp);
        if (!eventDate || eventDate < cutoffDate) return;

        if (data.type === 'menu_view') {
          menuViews += 1;
        }
        if (data.type === 'product_detail_click') {
          productDetailClicks += 1;
        }
      });

      setAnalyticsStats({
        menuViews,
        productDetailClicks,
      });
    });

    return () => unsubscribe();
  }, [store, timeRange]);

  if (!store) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
        <div className="bg-orange-50 p-4 rounded-full inline-flex mb-6">
          <QrCode className="text-orange-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Chào mừng bạn!</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Bạn chưa thiết lập thông tin cửa hàng. Hãy bắt đầu bằng cách cập nhật thông tin cơ bản để tạo Menu.</p>
        <a href="/dashboard/settings" className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
          Thiết lập ngay
        </a>
      </div>
    );
  }

  const menuUrl = `${window.location.origin}/m/${store.slug}`;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-menu-${store.slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-900">Chỉ số menu</h3>
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === 7 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            7 ngày
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === 30 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            30 ngày
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={<Eye className="text-emerald-500" size={16} />} label="Lượt xem menu" value={analyticsStats.menuViews} />
        <StatCard icon={<MousePointerClick className="text-fuchsia-500" size={16} />} label="Click chi tiết" value={analyticsStats.productDetailClicks} />
        <StatCard icon={<Utensils className="text-orange-500" size={16} />} label="Sản phẩm" value={stats.products} />
        <StatCard icon={<LayoutList className="text-blue-500" size={16} />} label="Danh mục" value={stats.categories} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-xl font-bold mb-6">Mã QR Menu của bạn</h3>
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 mb-6">
            <QRCodeSVG
              id="qr-code-svg"
              value={menuUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: store.logoUrl || "https://picsum.photos/seed/store/200/200",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <p className="text-sm text-gray-400 mb-8 break-all max-w-xs">{menuUrl}</p>
          <div className="flex gap-4 w-full">
            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-black transition-all"
            >
              <Download size={18} /> Tải mã QR
            </button>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
              <ExternalLink size={18} /> Xem Menu
            </a>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Hướng dẫn nhanh</h3>
          <div className="space-y-6">
            <TipItem step="1" title="Cập nhật thông tin" description="Vào phần Thông tin cửa hàng để cập nhật Logo, Ảnh bìa và giới thiệu cửa hàng." />
            <TipItem step="2" title="Tạo danh mục" description="Tạo các danh mục như: Đồ uống, Chăm sóc, Trẻ em..." />
            <TipItem step="3" title="Thêm sản phẩm" description="Thêm hình ảnh, mô tả và giá cho từng sản phẩm trong danh mục." />
            <TipItem step="4" title="In mã QR" description="Tải mã QR" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode, label: string, value: string | number }) {
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

function TipItem({ step, title, description }: { step: string, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center font-bold text-sm">
        {step}
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
