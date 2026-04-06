import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { User } from 'firebase/auth';
import { Store } from '../../types';
import { db } from '../../firebase';
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Save, Image as ImageIcon, CheckCircle, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { getStorageSetupHint, uploadImageWithBucketFallback } from '../../utils/storageUpload';
import { DEFAULT_MENU_TEMPLATE, getMenuTemplateById } from '../../constants/menuTemplates';

interface RestaurantSettingsProps {
  user: User;
  restaurant: Store | null;
  onCreated?: (id: string) => void;
}

const FONT_FAMILY_OPTIONS = ['Inter', 'Roboto', 'Playfair Display', 'Be Vietnam Pro'] as const;
const SIZE_PRESET_OPTIONS = ['large', 'normal', 'compact'] as const;
const CURRENCY_OPTIONS = ['EUR', 'USD', 'VND'] as const;

export default function RestaurantSettings({ user, restaurant, onCreated }: RestaurantSettingsProps) {
  const [activeSettingsNav, setActiveSettingsNav] = useState<'store-info' | 'customize'>('store-info');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    logoUrl: '',
    coverUrl: '',
    slug: '',
    address: '',
    phone: '',
    primaryColor: DEFAULT_MENU_TEMPLATE.primaryColor,
    secondaryColor: DEFAULT_MENU_TEMPLATE.secondaryColor,
    fontFamily: DEFAULT_MENU_TEMPLATE.fontFamily as Store['fontFamily'],
    sizePreset: DEFAULT_MENU_TEMPLATE.sizePreset as Store['sizePreset'],
    currency: DEFAULT_MENU_TEMPLATE.currency as Store['currency'],
    templateId: DEFAULT_MENU_TEMPLATE.id,
    themeColor: DEFAULT_MENU_TEMPLATE.primaryColor,
    menuVisibility: 'private' as 'public' | 'private'
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (restaurant) {
      const selectedTemplate = getMenuTemplateById(restaurant.templateId);
      setFormData({
        name: restaurant.name || '',
        bio: restaurant.bio || '',
        logoUrl: restaurant.logoUrl || '',
        coverUrl: restaurant.coverUrl || '',
        slug: restaurant.slug || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        primaryColor: restaurant.primaryColor || restaurant.themeColor || selectedTemplate.primaryColor,
        secondaryColor: restaurant.secondaryColor || selectedTemplate.secondaryColor,
        fontFamily: restaurant.fontFamily || selectedTemplate.fontFamily,
        sizePreset: restaurant.sizePreset || selectedTemplate.sizePreset,
        currency: restaurant.currency || selectedTemplate.currency,
        templateId: restaurant.templateId || selectedTemplate.id,
        themeColor: restaurant.themeColor || restaurant.primaryColor || selectedTemplate.primaryColor,
        menuVisibility: restaurant.menuVisibility || 'private'
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
        primaryColor: DEFAULT_MENU_TEMPLATE.primaryColor,
        secondaryColor: DEFAULT_MENU_TEMPLATE.secondaryColor,
        fontFamily: DEFAULT_MENU_TEMPLATE.fontFamily,
        sizePreset: DEFAULT_MENU_TEMPLATE.sizePreset,
        currency: DEFAULT_MENU_TEMPLATE.currency,
        templateId: DEFAULT_MENU_TEMPLATE.id,
        themeColor: DEFAULT_MENU_TEMPLATE.primaryColor,
        menuVisibility: 'private'
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
      if (!formData.name.trim()) throw new Error('Tên cửa hàng là bắt buộc.');
      if (!formData.slug.trim()) throw new Error('Đường dẫn (slug) là bắt buộc.');

      if (!restaurant || formData.slug !== restaurant.slug) {
        const q = query(collection(db, 'restaurants'), where('slug', '==', formData.slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          throw new Error('Đường dẫn (slug) đã tồn tại. Vui lòng chọn tên khác.');
        }
      }

      const normalizedPrimaryColor = formData.primaryColor || '#f97316';

      const dataToSave = {
        ...formData,
        templateId: formData.templateId || DEFAULT_MENU_TEMPLATE.id,
        primaryColor: normalizedPrimaryColor,
        themeColor: normalizedPrimaryColor,
        secondaryColor: formData.secondaryColor || '#fff7ed',
        fontFamily: formData.fontFamily || 'Inter',
        sizePreset: formData.sizePreset || 'normal',
        currency: formData.currency || 'VND',
        menuVisibility: formData.menuVisibility || 'private',
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
        setMessage({ type: 'success', text: 'Tạo cửa hàng mới thành công!' });
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
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-1 inline-flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveSettingsNav('store-info')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSettingsNav === 'store-info'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Thông tin cửa hàng
            </button>
            <button
              type="button"
              onClick={() => setActiveSettingsNav('customize')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSettingsNav === 'customize'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Tùy chỉnh
            </button>
          </div>

          {activeSettingsNav === 'store-info' && (
            <section className="rounded-3xl border border-gray-100 bg-gray-50/40 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Thông tin cửa hàng</h3>
                <p className="text-sm text-gray-500">Thông tin nhận diện và nội dung cơ bản hiển thị trên menu public.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên cửa hàng <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Ví dụ: Phở Gia Truyền"
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Đường dẫn Menu (Slug) <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2 px-5 py-4 bg-white border border-gray-100 rounded-2xl">
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
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="090..."
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Trạng thái Menu</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, menuVisibility: 'public' }))}
                        className={`px-4 py-2 rounded-2xl font-bold transition-all ${formData.menuVisibility === 'public'
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-700 border border-gray-100 hover:bg-green-50'
                          }`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, menuVisibility: 'private' }))}
                        className={`px-4 py-2 rounded-2xl font-bold transition-all ${formData.menuVisibility === 'private'
                          ? 'bg-gray-700 text-white'
                          : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-100'
                          }`}
                      >
                        Private
                      </button>
                      <span className="text-xs text-gray-500">(menu sẽ được công khai khi chọn Public)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Giới thiệu ngắn</label>
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Mô tả ngắn về cửa hàng của bạn..."
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="block text-sm font-bold text-gray-700">Logo (Ảnh đại diện)</label>
                  <div className="flex flex-col gap-4">
                    <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200 relative group">
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
                      className="flex items-center justify-center gap-2 bg-white border border-gray-100 text-gray-600 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
                    >
                      <Upload size={16} /> Tải ảnh lên
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh bìa (Cover Image)</label>
                    <div className="space-y-4">
                      <div className="w-full h-40 bg-white rounded-3xl flex items-center justify-center overflow-hidden border border-gray-200 relative">
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
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-100 text-gray-600 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
                      >
                        <Upload size={16} /> Tải ảnh lên
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSettingsNav === 'customize' && (
            <section className="rounded-3xl border border-gray-100 bg-white p-6 space-y-6">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900">Tùy chỉnh</h3>
                <p className="text-sm text-gray-500">Màu sắc và typography của menu public. Việc đổi template được thực hiện ở mục Giao diện.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Màu chủ đạo (Primary Color)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value, themeColor: e.target.value }))}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value, themeColor: e.target.value }))}
                    className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Màu nền phụ (Secondary Color)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Font Family</label>
                <select
                  value={formData.fontFamily}
                  onChange={(e) => setFormData(prev => ({ ...prev, fontFamily: e.target.value as Store['fontFamily'] }))}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  {FONT_FAMILY_OPTIONS.map((fontOption) => (
                    <option key={fontOption} value={fontOption}>{fontOption}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Kích thước hiển thị</label>
                  <select
                    value={formData.sizePreset}
                    onChange={(e) => setFormData(prev => ({ ...prev, sizePreset: e.target.value as Store['sizePreset'] }))}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  >
                    {SIZE_PRESET_OPTIONS.map((sizeOption) => (
                      <option key={sizeOption} value={sizeOption}>
                        {sizeOption === 'large' ? 'Large' : sizeOption === 'compact' ? 'Compact' : 'Normal'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tiền tệ</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as Store['currency'] }))}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  >
                    {CURRENCY_OPTIONS.map((currencyOption) => (
                      <option key={currencyOption} value={currencyOption}>{currencyOption}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-gray-100" style={{ backgroundColor: formData.secondaryColor, fontFamily: formData.fontFamily === 'Inter' ? 'Inter, Segoe UI, sans-serif' : formData.fontFamily === 'Roboto' ? 'Roboto, Segoe UI, sans-serif' : formData.fontFamily === 'Playfair Display' ? 'Playfair Display, Georgia, serif' : 'Be Vietnam Pro, Segoe UI, sans-serif' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: formData.primaryColor }}>
                  Preview menu style
                </p>
                <p className="mt-1 text-sm text-gray-700">Mẫu xem trước nhanh cho màu sắc và typography của menu public.</p>
              </div>
            </section>
          )}

        </form>
      </div>
    </div>
  );
}
