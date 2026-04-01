import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { User } from 'firebase/auth';
import { Restaurant } from '../../types';
import { db } from '../../firebase';
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Save, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface RestaurantSettingsProps {
  user: User;
  restaurant: Restaurant | null;
}

export default function RestaurantSettings({ user, restaurant }: RestaurantSettingsProps) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    logoUrl: '',
    coverUrl: '',
    slug: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        bio: restaurant.bio || '',
        logoUrl: restaurant.logoUrl || '',
        coverUrl: restaurant.coverUrl || '',
        slug: restaurant.slug || ''
      });
    }
  }, [restaurant]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Check if slug is unique (if changed)
      if (!restaurant || formData.slug !== restaurant.slug) {
        const q = query(collection(db, 'restaurants'), where('slug', '==', formData.slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          throw new Error('Đường dẫn (slug) đã tồn tại. Vui lòng chọn tên khác.');
        }
      }

      if (restaurant) {
        await updateDoc(doc(db, 'restaurants', restaurant.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        const newDocRef = doc(collection(db, 'restaurants'));
        await setDoc(newDocRef, {
          ...formData,
          ownerId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi lưu thông tin.' });
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Cài đặt nhà hàng</h2>
            <p className="text-gray-400 text-sm mt-1">Quản lý thông tin hiển thị trên menu của bạn</p>
          </div>
          <button 
            type="submit" 
            form="settings-form"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-200"
          >
            <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        {message && (
          <div className={`mx-8 mt-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <form id="settings-form" onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên nhà hàng</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Ví dụ: Phở Gia Truyền"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Đường dẫn Menu (Slug)</label>
                <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl">
                  <span className="text-gray-400 text-sm">/m/</span>
                  <input 
                    type="text" 
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/ /g, '-') }))}
                    className="flex-1 bg-transparent focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giới thiệu ngắn</label>
                <textarea 
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Mô tả ngắn về nhà hàng của bạn..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL Logo (Ảnh đại diện)</label>
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                    {formData.logoUrl ? <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon className="text-gray-300" />}
                  </div>
                  <input 
                    type="url" 
                    value={formData.logoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL Ảnh bìa (Cover Image)</label>
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200">
                    {formData.coverUrl ? <img src={formData.coverUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon className="text-gray-300" />}
                  </div>
                  <input 
                    type="url" 
                    value={formData.coverUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                    placeholder="https://example.com/cover.png"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
