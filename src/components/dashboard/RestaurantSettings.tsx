import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { User } from 'firebase/auth';
import { Restaurant } from '../../types';
import { db } from '../../firebase';
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Save, Image as ImageIcon, CheckCircle, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { getStorageSetupHint, uploadImageWithBucketFallback } from '../../utils/storageUpload';

interface RestaurantSettingsProps {
  user: User;
  restaurant: Restaurant | null;
  onCreated?: (id: string) => void;
}

export default function RestaurantSettings({ user, restaurant, onCreated }: RestaurantSettingsProps) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    logoUrl: '',
    coverUrl: '',
    slug: '',
    address: '',
    phone: '',
    themeColor: '#f97316' // Default orange-500
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        bio: restaurant.bio || '',
        logoUrl: restaurant.logoUrl || '',
        coverUrl: restaurant.coverUrl || '',
        slug: restaurant.slug || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        themeColor: restaurant.themeColor || '#f97316'
      });
    } else {
      setFormData({
        name: '',
        bio: '',
        logoUrl: '',
        coverUrl: '',
        slug: '',
        address: '',
        phone: '',
        themeColor: '#f97316'
      });
    }
  }, [restaurant]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
      const uploadPath = `restaurants/${user.uid}/${type}_${Date.now()}`;
      const url = await uploadImageWithBucketFallback(uploadPath, file);
      setFormData(prev => ({ ...prev, [type === 'logo' ? 'logoUrl' : 'coverUrl']: url }));
    } catch (err) {
      console.error('Restaurant image upload failed:', err);
      setMessage({ type: 'error', text: `Không thể tải ảnh lên. Vào Firebase Console > Build > Storage > Get started để tạo bucket. ${getStorageSetupHint()}` });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!formData.name.trim()) throw new Error('Tên nhà hàng là bắt buộc.');
      if (!formData.slug.trim()) throw new Error('Đường dẫn (slug) là bắt buộc.');

      if (!restaurant || formData.slug !== restaurant.slug) {
        const q = query(collection(db, 'restaurants'), where('slug', '==', formData.slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          throw new Error('Đường dẫn (slug) đã tồn tại. Vui lòng chọn tên khác.');
        }
      }

      const dataToSave = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      if (restaurant) {
        await updateDoc(doc(db, 'restaurants', restaurant.id), dataToSave);
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      } else {
        const newDocRef = doc(collection(db, 'restaurants'));
        await setDoc(newDocRef, {
          ...dataToSave,
          ownerId: user.uid,
          createdAt: new Date().toISOString()
        });
        setMessage({ type: 'success', text: 'Tạo nhà hàng mới thành công!' });
        if (onCreated) onCreated(newDocRef.id);
      }
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
      slug: prev.slug || name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Thông tin cửa hàng</h2>
            <p className="text-gray-400 text-sm mt-1">Quản lý thông tin hiển thị và giao diện menu</p>
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
          <div className={`mx-8 mt-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <form id="settings-form" onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên nhà hàng <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Đường dẫn Menu (Slug) <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP.HCM"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="090..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Màu chủ đạo (Theme Color)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.themeColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                    className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-mono"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Logo (Ảnh đại diện)</label>
                <div className="flex flex-col gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-3xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200 relative group">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="text-gray-300 w-8 h-8" />
                    )}
                    {uploading === 'logo' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-gray-600 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
                  >
                    <Upload size={16} /> Tải ảnh lên
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh bìa (Cover Image)</label>
                <div className="space-y-4">
                  <div className="w-full h-40 bg-gray-100 rounded-3xl flex items-center justify-center overflow-hidden border border-gray-200 relative">
                    {formData.coverUrl ? (
                      <img src={formData.coverUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="text-gray-300 w-8 h-8" />
                    )}
                    {uploading === 'cover' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={(e) => handleFileUpload(e, 'cover')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-gray-600 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
                  >
                    <Upload size={16} /> Tải ảnh lên
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
