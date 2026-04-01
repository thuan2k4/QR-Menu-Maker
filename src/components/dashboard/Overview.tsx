import { QRCodeSVG } from 'qrcode.react';
import { User } from 'firebase/auth';
import { Restaurant } from '../../types';
import { Download, ExternalLink, QrCode, Utensils, LayoutList } from 'lucide-react';
import React, { useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface OverviewProps {
  user: User;
  restaurant: Restaurant | null;
}

export default function Overview({ user, restaurant }: OverviewProps) {
  const [stats, setStats] = useState({ categories: 0, products: 0 });

  useEffect(() => {
    if (restaurant) {
      const fetchStats = async () => {
        const catQuery = query(collection(db, 'categories'), where('restaurantId', '==', restaurant.id));
        const prodQuery = query(collection(db, 'products'), where('restaurantId', '==', restaurant.id));
        const [catSnap, prodSnap] = await Promise.all([getDocs(catQuery), getDocs(prodQuery)]);
        setStats({ categories: catSnap.size, products: prodSnap.size });
      };
      fetchStats();
    }
  }, [restaurant]);

  if (!restaurant) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
        <div className="bg-orange-50 p-4 rounded-full inline-flex mb-6">
          <QrCode className="text-orange-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Chào mừng bạn!</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Bạn chưa thiết lập thông tin nhà hàng. Hãy bắt đầu bằng cách cập nhật thông tin cơ bản để tạo Menu.</p>
        <a href="/dashboard/settings" className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
          Thiết lập ngay
        </a>
      </div>
    );
  }

  const menuUrl = `${window.location.origin}/m/${restaurant.slug}`;

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
        downloadLink.download = `qr-menu-${restaurant.slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Utensils className="text-orange-500" />} label="Sản phẩm" value={stats.products} />
        <StatCard icon={<LayoutList className="text-blue-500" />} label="Danh mục" value={stats.categories} />
        <StatCard icon={<QrCode className="text-green-500" />} label="Lượt quét" value="Sắp có" />
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
                src: restaurant.logoUrl || "https://picsum.photos/seed/restaurant/200/200",
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
            <TipItem step="1" title="Cập nhật thông tin" description="Vào phần Thông tin cửa hàng để cập nhật Logo, Ảnh bìa và giới thiệu nhà hàng." />
            <TipItem step="2" title="Tạo danh mục" description="Tạo các danh mục như: Khai vị, Món chính, Đồ uống..." />
            <TipItem step="3" title="Thêm món ăn" description="Thêm hình ảnh, mô tả và giá cho từng món ăn trong danh mục." />
            <TipItem step="4" title="In mã QR" description="Tải mã QR về, in ra và dán tại bàn để khách hàng quét." />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className="bg-gray-50 p-3 rounded-2xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
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
