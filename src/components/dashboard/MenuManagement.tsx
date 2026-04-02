import React, { useState, useEffect, FormEvent, useRef, ChangeEvent } from 'react';
import { User } from 'firebase/auth';
import { Store, Category, Product, Variant } from '../../types';
import { db } from '../../firebase';

const EU_DEFAULT_HASHTAGS = [
  '#organic', '#vegan', '#gluten-free', '#farm-to-table', '#locally-sourced',
  '#easy-togo', '#allergen-free', '#low-carb', '#non-gmo', '#plantbased',
  '#dessert', '#quick-bite', '#healthy', '#family-friendly', '#seasonal',
  '#kids-friendly', '#street-food', '#premium', '#modern', '#artisan'
];
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import {
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  ChevronRight,
  Image as ImageIcon,
  Check,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { getStorageSetupHint, uploadImageWithBucketFallback } from '../../utils/storageUpload';

interface MenuManagementProps {
  user: User;
  store: Store | null;
}

const CURRENCY_LOCALE_MAP: Record<'EUR' | 'USD' | 'VND', string> = {
  EUR: 'de-DE',
  USD: 'en-US',
  VND: 'vi-VN'
};

const formatPriceByCurrency = (value: number, currency: 'EUR' | 'USD' | 'VND') => {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE_MAP[currency], {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'VND' ? 0 : 2
    }).format(value);
  } catch {
    return `${value.toLocaleString('vi-VN')}đ`;
  }
};

export default function MenuManagement({ user, store }: MenuManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (store) {
      const catQuery = query(collection(db, 'categories'), where('restaurantId', '==', store.id));
      const prodQuery = query(collection(db, 'products'), where('restaurantId', '==', store.id));

      const unsubCats = onSnapshot(catQuery, (snap) => {
        const cats = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Category))
          .sort((a, b) => a.order - b.order);
        setCategories(cats);
        setActiveCategory((prev) => {
          if (cats.length === 0) return null;
          if (prev && cats.some((cat) => cat.id === prev)) return prev;
          return cats[0].id;
        });
      }, (error) => {
        console.error('Failed to subscribe categories snapshot:', error);
      });

      const unsubProds = onSnapshot(prodQuery, (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      }, (error) => {
        console.error('Failed to subscribe products snapshot:', error);
      });

      return () => {
        unsubCats();
        unsubProds();
      };
    }
  }, [store]);

  if (!store) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
        <p className="text-gray-500">Vui lòng thiết lập thông tin cửa hàng trước khi quản lý Menu.</p>
      </div>
    );
  }

  const storeCurrency: 'EUR' | 'USD' | 'VND' = store.currency === 'EUR' || store.currency === 'USD' || store.currency === 'VND'
    ? store.currency
    : 'VND';

  const getProductDisplayPrice = (prod: Product) => {
    const variants = prod.variants || [];
    const validVariantPrices = variants
      .map((v) => Number(v.price))
      .filter((p) => !Number.isNaN(p));

    if (validVariantPrices.length > 0) {
      const min = Math.min(...validVariantPrices);
      const max = Math.max(...validVariantPrices);
      if (min === max) {
        return formatPriceByCurrency(min, storeCurrency);
      }
      return `Từ ${formatPriceByCurrency(min, storeCurrency)} - ${formatPriceByCurrency(max, storeCurrency)}`;
    }

    return formatPriceByCurrency(prod.price || 0, storeCurrency);
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory)
    : [];

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm trong danh mục cũng sẽ bị ảnh hưởng.')) {
      await deleteDoc(doc(db, 'categories', id));
      if (activeCategory === id) setActiveCategory(categories.find(c => c.id !== id)?.id || null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Categories Sidebar */}
      <div className="w-full md:w-72 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Danh mục</h3>
          <button
            onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
            className="p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100 transition-all"
          >
            <FolderPlus size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${activeCategory === cat.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span className="font-bold truncate pr-2">{cat.name}</span>
              <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${activeCategory === cat.id ? 'text-white' : 'text-gray-400'}`}>
                <button onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setShowCategoryModal(true); }} className="p-1 hover:bg-white/20 rounded">
                  <Edit2 size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="p-1 hover:bg-white/20 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Chưa có danh mục nào</p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {categories.find(c => c.id === activeCategory)?.name || 'Sản phẩm'}
          </h3>
          <button
            disabled={!activeCategory}
            onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-200"
          >
            <Plus size={18} /> Thêm sản phẩm
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(prod => (
            <div key={prod.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {prod.imageUrl ? (
                  <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingProduct(prod); setShowProductModal(true); }} className="bg-white p-2 rounded-xl text-gray-600 hover:text-orange-500 shadow-sm">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteProduct(prod.id)} className="bg-white p-2 rounded-xl text-gray-600 hover:text-red-500 shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 truncate pr-2">{prod.name}</h4>
                  <span className="text-orange-500 font-bold whitespace-nowrap">{getProductDisplayPrice(prod)}</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{prod.shortDescription || prod.longDescription || prod.description || 'Chưa có mô tả'}</p>
                {prod.hashtags && prod.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prod.hashtags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {activeCategory && filteredProducts.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-gray-100 text-center">
              <p className="text-gray-400">Chưa có sản phẩm nào trong danh mục này</p>
            </div>
          )}
          {!activeCategory && (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-gray-100 text-center">
              <p className="text-gray-400">Vui lòng chọn hoặc tạo danh mục trước</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCategoryModal && (
        <CategoryModal
          storeId={store.id}
          editing={editingCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
      {showProductModal && (
        <ProductModal
          user={user}
          storeId={store.id}
          currency={storeCurrency}
          categoryId={activeCategory!}
          editing={editingProduct}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  );
}

function CategoryModal({ storeId, editing, onClose }: { storeId: string, editing: Category | null, onClose: () => void }) {
  const [name, setName] = useState(editing?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'categories', editing.id), { name });
      } else {
        await addDoc(collection(db, 'categories'), {
          name,
          order: Date.now(),
          storeId,
          restaurantId: storeId,
          createdAt: new Date().toISOString()
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-xl font-bold">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tên danh mục <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Món chính, Đồ uống..."
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu danh mục'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductModal({ user, storeId, categoryId, currency, editing, onClose }: { user: User, storeId: string, categoryId: string, currency: 'EUR' | 'USD' | 'VND', editing: Product | null, onClose: () => void }) {
  const initialPriceValue = editing?.price != null ? Number(editing.price) : null;
  const normalizedInitialPrice = initialPriceValue != null && Number.isFinite(initialPriceValue) ? initialPriceValue : null;
  const initialHashtags = Array.isArray(editing?.hashtags)
    ? editing.hashtags.filter((tag): tag is string => typeof tag === 'string').slice(0, 20)
    : [];
  const initialVariants = Array.isArray(editing?.variants)
    ? editing.variants
      .filter((variant): variant is Variant => !!variant && typeof variant === 'object')
      .slice(0, 20)
      .map((variant, index) => {
        const variantPrice = Number(variant.price);
        return {
          id: typeof variant.id === 'string' && variant.id ? variant.id : `${Date.now()}-${index}`,
          name: typeof variant.name === 'string' ? variant.name : '',
          price: Number.isFinite(variantPrice) && variantPrice >= 0 ? variantPrice : 0,
          isDefault: Boolean(variant.isDefault),
          sortOrder: typeof variant.sortOrder === 'number' ? variant.sortOrder : index
        };
      })
    : [];

  const [formData, setFormData] = useState<{
    name: string;
    shortDescription: string;
    longDescription: string;
    price: number | null;
    hashtags: string[];
    variants: Variant[];
    imageUrl: string;
  }>({
    name: editing?.name || '',
    shortDescription: typeof editing?.shortDescription === 'string' ? editing.shortDescription : '',
    longDescription: typeof editing?.longDescription === 'string' ? editing.longDescription : '',
    price: normalizedInitialPrice,
    hashtags: initialHashtags,
    variants: initialVariants,
    imageUrl: typeof editing?.imageUrl === 'string' ? editing.imageUrl : ''
  });
  const [priceInput, setPriceInput] = useState(normalizedInitialPrice != null ? String(normalizedInitialPrice) : '');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (value: number) => formatPriceByCurrency(value, currency);

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let normalized: string;
    if (currency === 'VND') {
      normalized = raw.replace(/\D/g, '');
    } else {
      normalized = raw.replace(/[^0-9.]/g, '');
      const parts = normalized.split('.');
      if (parts.length > 2) {
        normalized = `${parts[0]}.${parts[1]}`;
      }
      if (parts[1]?.length > 2) {
        normalized = `${parts[0]}.${parts[1].slice(0, 2)}`;
      }
    }
    setPriceInput(normalized);
    setFormData(prev => ({ ...prev, price: normalized === '' ? null : Number(normalized) }));
  };

  const handlePriceBlur = () => {
    if (!priceInput) return;
    const value = Number(priceInput);
    if (Number.isNaN(value)) {
      setPriceInput('');
      setFormData(prev => ({ ...prev, price: null }));
      return;
    }
    const formatted = currency === 'VND' ? String(Math.round(value)) : value.toFixed(2);
    setPriceInput(formatted);
    setFormData(prev => ({ ...prev, price: Number(formatted) }));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadPath = `products/${user.uid}/${Date.now()}_${file.name}`;
      const url = await uploadImageWithBucketFallback(uploadPath, file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Product image upload failed:', err);
      alert(`Không thể tải ảnh lên. Vui lòng vào Firebase Console > Build > Storage > Get started để tạo bucket. ${getStorageSetupHint()}`);
    } finally {
      setUploading(false);
    }
  };

  const addHashtag = () => {
    const normalized = newTag.trim().toLowerCase().replace(/^#?/, '#');
    if (!normalized || formData.hashtags.includes(normalized)) {
      setNewTag('');
      return;
    }
    setFormData(prev => ({ ...prev, hashtags: [...prev.hashtags, normalized] }));
    setNewTag('');
  };

  const removeHashtag = (tag: string) => {
    setFormData(prev => ({ ...prev, hashtags: prev.hashtags.filter((t) => t !== tag) }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: '',
        price: prev.variants.length === 0 ? Number(prev.price ?? 0) : 0,
        isDefault: prev.variants.length === 0,
        sortOrder: prev.variants.length
      }]
    }));
  };

  const updateVariant = (id: string, update: Partial<Variant>) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((item) => item.id === id ? { ...item, ...update } : item)
    }));
  };

  const updateVariantPrice = (id: string, value: string) => {
    let normalized: string;
    if (currency === 'VND') {
      normalized = value.replace(/\D/g, '');
    } else {
      normalized = value.replace(/[^0-9.]/g, '');
      const parts = normalized.split('.');
      if (parts.length > 2) {
        normalized = `${parts[0]}.${parts[1]}`;
      }
      if (parts[1]?.length > 2) {
        normalized = `${parts[0]}.${parts[1].slice(0, 2)}`;
      }
    }
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((item) => item.id === id ? { ...item, price: normalized === '' ? 0 : Number(normalized) } : item)
    }));
  };

  const setVariantDefault = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((item) => ({
        ...item,
        isDefault: item.id === id
      }))
    }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants
        .filter((item) => item.id !== id)
        .map((item, idx) => ({ ...item, sortOrder: idx }))
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const hasVariants = formData.variants.length > 0;

    const normalizedBasePrice = Number(formData.price ?? 0);
    if (!hasVariants && (!Number.isFinite(normalizedBasePrice) || normalizedBasePrice < 0)) {
      alert('Vui lòng nhập giá hợp lệ (số nguyên >= 0).');
      return;
    }

    const normalizedHashtags = (Array.isArray(formData.hashtags) ? formData.hashtags : [])
      .map((tag) => String(tag).trim().toLowerCase().replace(/^#?/, '#'))
      .filter((tag) => tag.length > 1)
      .slice(0, 20);

    const normalizedVariants = (Array.isArray(formData.variants) ? formData.variants : [])
      .slice(0, 20)
      .map((variant, index) => {
        const variantPrice = Number(variant.price);
        return {
          id: typeof variant.id === 'string' && variant.id ? variant.id : `${Date.now()}-${index}`,
          name: typeof variant.name === 'string' ? variant.name.trim() : '',
          price: Number.isFinite(variantPrice) && variantPrice >= 0 ? variantPrice : 0,
          isDefault: Boolean(variant.isDefault),
          sortOrder: typeof variant.sortOrder === 'number' ? variant.sortOrder : index
        };
      });

    const normalizedShortDescription = formData.shortDescription.trim();
    const normalizedLongDescription = formData.longDescription.trim();
    const normalizedDescription = normalizedLongDescription || normalizedShortDescription;
    const targetCategoryId = editing?.categoryId || categoryId;

    setLoading(true);
    try {
      const variantPrices = normalizedVariants
        .map((variant) => variant.price)
        .filter((price) => Number.isFinite(price));
      const choicePrice = variantPrices.length > 0
        ? Math.min(...variantPrices)
        : (Number.isFinite(normalizedBasePrice) ? normalizedBasePrice : 0);

      const data = {
        name: formData.name.trim(),
        shortDescription: normalizedShortDescription,
        longDescription: normalizedLongDescription,
        description: normalizedDescription,
        price: choicePrice ?? 0,
        hashtags: normalizedHashtags,
        variants: normalizedVariants,
        imageUrl: formData.imageUrl.trim(),
        categoryId: targetCategoryId,
        storeId,
        restaurantId: storeId,
        updatedAt: new Date().toISOString()
      };

      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), data);
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: new Date().toISOString()
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasVariants = formData.variants.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        <div className="p-5 sm:p-6 border-b border-gray-50 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-bold">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
            <p className="text-xs text-gray-500 mt-1">Tiền tệ hiện tại của cửa hàng: <span className="font-semibold text-orange-600">{currency}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên món ăn/sản phẩm <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ví dụ: Phở bò đặc biệt"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả ngắn</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Tóm tắt trong 1-2 câu"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={formData.longDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                  placeholder="Mô tả chi tiết hơn về nguyên liệu, đồ ăn..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              {!hasVariants && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Giá bán <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step={currency === 'VND' ? 1 : 0.01}
                    min={0}
                    inputMode={currency === 'VND' ? 'numeric' : 'decimal'}
                    required
                    value={priceInput}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
                    placeholder={`Nhập giá theo ${currency}, ví dụ ${currency === 'VND' ? '45000' : '45.00'}`}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {priceInput ? `Giá hiển thị: ${formatCurrency(Number(priceInput))}` : 'Bạn có thể để trống rồi nhập giá sau.'}
                  </p>
                </div>
              )}
              {hasVariants && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-blue-700">
                  Đang dùng giá theo variants. Giá đơn đã được ẩn.
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Hình ảnh sản phẩm</label>
                <div className="space-y-4">
                  <div className="w-full h-48 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200 relative">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="text-gray-300 w-12 h-12" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-gray-600 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
                  >
                    <Upload size={16} /> Tải ảnh lên
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100">
            <h4 className="font-bold mb-3">Hashtags (thẻ)</h4>
            <div className="flex gap-2 flex-wrap mb-3">
              {EU_DEFAULT_HASHTAGS.slice(0, 8).map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    if (!formData.hashtags.includes(tag)) {
                      setFormData(prev => ({ ...prev, hashtags: [...prev.hashtags, tag] }));
                    }
                  }}
                  className={`px-2 py-1 rounded-full border text-xs ${formData.hashtags.includes(tag) ? 'bg-orange-500 text-white border-orange-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="#ví dụ"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={addHashtag}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
              >Thêm</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.hashtags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100 text-sm">
                  {tag}
                  <button type="button" onClick={() => removeHashtag(tag)} className="text-xs font-bold">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold">Variants (tuỳ chọn giá)</h4>
                <p className="text-xs text-gray-500">Đơn vị tiền tệ đang áp dụng: {currency}</p>
              </div>
              <button type="button" onClick={addVariant} className="px-3 py-1.5 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600">Thêm variant</button>
            </div>
            {formData.variants.length === 0 && <p className="text-xs text-gray-400">Chưa có variant. Tạo variant để hiển thị đoạn giá Từ - Đến.</p>}
            <div className="space-y-2">
              {formData.variants.map((variant) => (
                <div key={variant.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <input
                    className="sm:col-span-5 px-3 py-2 border rounded-xl"
                    value={variant.name}
                    onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                    placeholder="Tên variant, ví dụ: Nhỏ"
                  />
                  <input
                    className="sm:col-span-4 px-3 py-2 border rounded-xl"
                    type="number"
                    step={currency === 'VND' ? 1 : 0.01}
                    min={0}
                    inputMode={currency === 'VND' ? 'numeric' : 'decimal'}
                    value={variant.price.toString()}
                    onChange={(e) => updateVariantPrice(variant.id, e.target.value)}
                    onBlur={(e) => {
                      const normalized = currency === 'VND'
                        ? e.target.value.replace(/\D/g, '')
                        : e.target.value.replace(/[^0-9.]/g, '');
                      updateVariantPrice(variant.id, normalized);
                    }}
                    placeholder={`Giá (${currency})`}
                  />
                  <label className="sm:col-span-2 text-xs flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={variant.isDefault || false}
                      onChange={() => setVariantDefault(variant.id)}
                    />
                    Default
                  </label>
                  <button
                    type="button"
                    className="sm:col-span-1 text-red-500 font-bold justify-self-end"
                    onClick={() => removeVariant(variant.id)}
                  >×</button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </form>
      </div>
    </div>
  );
}
