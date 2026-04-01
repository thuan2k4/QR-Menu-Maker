import React, { useState, useEffect, FormEvent } from 'react';
import { User } from 'firebase/auth';
import { Restaurant, Category, Product } from '../../types';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy 
} from 'firebase/firestore';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  FolderPlus, 
  ChevronRight, 
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';

interface MenuManagementProps {
  user: User;
  restaurant: Restaurant | null;
}

export default function MenuManagement({ user, restaurant }: MenuManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (restaurant) {
      const catQuery = query(collection(db, 'categories'), where('restaurantId', '==', restaurant.id), orderBy('order', 'asc'));
      const prodQuery = query(collection(db, 'products'), where('restaurantId', '==', restaurant.id));

      const unsubCats = onSnapshot(catQuery, (snap) => {
        const cats = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        setCategories(cats);
        if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0].id);
      });

      const unsubProds = onSnapshot(prodQuery, (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      });

      return () => {
        unsubCats();
        unsubProds();
      };
    }
  }, [restaurant]);

  if (!restaurant) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
        <p className="text-gray-500">Vui lòng thiết lập thông tin nhà hàng trước khi quản lý Menu.</p>
      </div>
    );
  }

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
              className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                activeCategory === cat.id 
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
                {!prod.isAvailable && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded-full">Hết hàng</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 truncate pr-2">{prod.name}</h4>
                  <span className="text-orange-500 font-bold whitespace-nowrap">{prod.price.toLocaleString('vi-VN')}đ</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{prod.description || 'Chưa có mô tả'}</p>
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
          restaurantId={restaurant.id}
          editing={editingCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
      {showProductModal && (
        <ProductModal 
          restaurantId={restaurant.id}
          categoryId={activeCategory!}
          editing={editingProduct}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  );
}

function CategoryModal({ restaurantId, editing, onClose }: { restaurantId: string, editing: Category | null, onClose: () => void }) {
  const [name, setName] = useState(editing?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'categories', editing.id), { name });
      } else {
        await addDoc(collection(db, 'categories'), {
          name,
          order: Date.now(),
          restaurantId,
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Tên danh mục</label>
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

function ProductModal({ restaurantId, categoryId, editing, onClose }: { restaurantId: string, categoryId: string, editing: Product | null, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: editing?.name || '',
    description: editing?.description || '',
    price: editing?.price || 0,
    imageUrl: editing?.imageUrl || '',
    isAvailable: editing?.isAvailable ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), formData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...formData,
          categoryId,
          restaurantId,
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
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên món ăn/sản phẩm</label>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Giá bán (VNĐ)</label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả thành phần, hương vị..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL Hình ảnh</label>
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200">
                    {formData.imageUrl ? <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon className="text-gray-300" />}
                  </div>
                  <input 
                    type="url" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/food.jpg"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.isAvailable ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isAvailable ? 'left-7' : 'left-1'}`} />
                </button>
                <span className="text-sm font-bold text-gray-700">Còn hàng</span>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </form>
      </div>
    </div>
  );
}
