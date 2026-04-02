import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { QrCode, Utensils, Smartphone, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-lg">
            <QrCode className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">MenuQRGenerate</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-orange-500 transition-colors">Tính năng</a>
          <Link to="/login" className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition-colors">Bắt đầu ngay</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6"
        >
          Menu Kỹ Thuật Số <br />
          <span className="text-orange-500">Chuyên Nghiệp</span> Trong 5 Phút
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-500 max-w-2xl mx-auto mb-10"
        >
          Giải pháp tạo QR Menu tối ưu cho cửa hàng, quán cafe, dịch vụ. Giúp khách hàng xem món nhanh chóng, an toàn và hiện đại.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login" className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
            Tạo Menu Miễn Phí
          </Link>
          <a href="#features" className="w-full sm:w-auto border border-gray-200 text-gray-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-all">
            Xem Demo
          </a>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Tại sao chọn MenuQRGenerate?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Utensils className="w-8 h-8 text-orange-500" />}
              title="Quản lý dễ dàng"
              description="Cập nhật sản phẩm, giá cả, hình ảnh chỉ trong vài giây. Không cần in lại menu giấy."
            />
            <FeatureCard
              icon={<Smartphone className="w-8 h-8 text-orange-500" />}
              title="Tối ưu Mobile"
              description="Menu hiển thị mượt mà trên mọi thiết bị di động. Khách hàng không cần cài ứng dụng."
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-orange-500" />}
              title="Tạo QR Tự Động"
              description="Hệ thống tự động tạo mã QR duy nhất cho cửa hàng của bạn. Tải về và in ngay."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>&copy; 2026 MenuQRGenerate. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
