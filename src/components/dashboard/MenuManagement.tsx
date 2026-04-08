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
  doc,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import {
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  Image as ImageIcon,
  Check,
  X,
  Upload,
  Loader2,
  GripVertical
} from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { getStorageSetupHint, uploadImageWithBucketFallback } from '../../utils/storageUpload';
import { useTranslation } from '../../i18n';

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

function DraggableCategoryItem({ cat, isActive, onClick, onEdit, onDelete, onDragEnd }: { cat: Category, isActive: boolean, onClick: () => void, onEdit: () => void, onDelete: () => void, onDragEnd: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={cat} dragListener={false} dragControls={controls} onDragEnd={onDragEnd}>
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
        className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all select-none ${isActive
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
          : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'
          }`}
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div
            onPointerDown={(e) => controls.start(e)}
            className={`cursor-grab active:cursor-grabbing p-1.5 -ml-1.5 rounded-lg hover:bg-black/5 transition-colors ${isActive ? 'text-white/70 hover:text-white' : 'text-gray-300 hover:text-gray-500'}`}
            style={{ touchAction: 'none' }}
          >
            <GripVertical size={16} />
          </div>
          <span className="font-bold truncate pr-2 select-none">{cat.name}</span>
        </div>
        <div className={`flex items-center gap-1 transition-opacity ${isActive ? 'text-white/90' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:bg-black/10 rounded-lg transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:bg-black/10 hover:text-red-500 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

function DraggableProductItem({ prod, getProductDisplayPrice, onEdit, onDelete, onDragEnd }: { prod: Product, getProductDisplayPrice: (p: Product) => string, onEdit: () => void, onDelete: () => void, onDragEnd: () => void }) {
  const { t } = useTranslation();
  const controls = useDragControls();
  return (
    <Reorder.Item value={prod} dragListener={false} dragControls={controls} onDragEnd={onDragEnd} className="relative z-0 focus-within:z-10 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex flex-col sm:flex-row items-stretch p-3 gap-4 select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
        {/* Drag Handle (Desktop) */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="hidden sm:flex items-center justify-center cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={20} />
        </div>

        {/* Image Container */}
        <div className="w-full sm:w-28 h-40 sm:h-24 rounded-xl bg-gray-50 overflow-hidden shrink-0 relative border border-gray-100/50">
          {/* Drag Handle (Mobile overlay) */}
          <div
            onPointerDown={(e) => controls.start(e)}
            className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-gray-500 sm:hidden z-10 cursor-grab active:cursor-grabbing shadow-sm border border-gray-100"
            style={{ touchAction: 'none' }}
          >
            <GripVertical size={16} />
          </div>

          {prod.imageUrl ? (
            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover select-none pointer-events-none" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImageIcon size={24} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1 flex flex-col justify-center gap-2">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h4 className="font-bold text-gray-900 truncate text-base sm:text-lg max-w-full leading-tight">{prod.name}</h4>
            <span className="text-orange-600 font-bold whitespace-nowrap bg-orange-50 px-2 py-0.5 rounded-md text-xs sm:text-sm shadow-sm border border-orange-100">{getProductDisplayPrice(prod)}</span>
          </div>
          <p className="text-xs sm:text-sm font-italic text-gray-500 line-clamp-2 leading-relaxed">{prod.shortDescription || ''}</p>
          <p className="text-lg sm:text-sm text-black-900 font-bold line-clamp-2 leading-relaxed">{prod.longDescription || prod.description || ''}</p>
          {prod.hashtags && prod.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {prod.hashtags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-[10px] sm:text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100 shadow-sm">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Desktop/Tablet Actions */}
        <div className="hidden sm:flex items-center gap-1.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onEdit} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Mobile Actions (Visible on small screens) */}
        <div className="flex sm:hidden items-center gap-2 w-full pt-3 mt-1 border-t border-gray-50 shrink-0">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-bold text-sm transition-colors">
            <Edit2 size={16} /> {t('menuManagement.edit')}
          </button>
          <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 font-bold text-sm transition-colors">
            <Trash2 size={16} /> {t('menuManagement.delete')}
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function MenuManagement({ user, store }: MenuManagementProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guard: block onSnapshot from overwriting state during drag operations
  const isDragging = useRef(false);
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoriesRef = useRef(categories);
  const productsRef = useRef(products);
  // Refs to capture the latest reordered arrays
  const dragCategoriesRef = useRef<Category[]>([]);
  const dragProductsRef = useRef<Product[]>([]);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    if (store) {
      const catQuery = query(collection(db, 'categories'), where('restaurantId', '==', store.id));
      const prodQuery = query(collection(db, 'products'), where('restaurantId', '==', store.id));

      const unsubCats = onSnapshot(catQuery, (snap) => {
        // Skip snapshot updates while user is dragging to prevent snap-back
        if (isDragging.current) return;
        const cats = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Category))
          .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
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
        // Skip snapshot updates while user is dragging to prevent snap-back
        if (isDragging.current) return;
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)));
      }, (error) => {
        console.error('Failed to subscribe products snapshot:', error);
      });

      return () => {
        unsubCats();
        unsubProds();
        if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
      };
    }
  }, [store]);

  if (!store) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
        <p className="text-gray-500">{t('menuManagement.setupStoreFirst')}</p>
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
      return t('menuManagement.priceFromRange', {
        min: formatPriceByCurrency(min, storeCurrency),
        max: formatPriceByCurrency(max, storeCurrency)
      });
    }

    return formatPriceByCurrency(prod.price || 0, storeCurrency);
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory)
    : [];

  const handleDeleteCategory = (id: string) => {
    setConfirmDialog({
      message: t('menuManagement.confirmDeleteCategoryMessage'),
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const batchItems: any[] = [];
          const prodQ = query(collection(db, 'products'), where('categoryId', '==', id));
          const prodSnap = await getDocs(prodQ);
          prodSnap.docs.forEach(d => batchItems.push(d.ref));
          batchItems.push(doc(db, 'categories', id));

          const chunks = [];
          for (let i = 0; i < batchItems.length; i += 500) {
            chunks.push(batchItems.slice(i, i + 500));
          }
          for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach(ref => batch.delete(ref));
            await batch.commit();
          }
          if (activeCategory === id) setActiveCategory(categories.find(c => c.id !== id)?.id || null);
        } catch (err) {
          console.error('Failed to cascade delete category:', err);
        } finally {
          setIsDeleting(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleDeleteProduct = (id: string) => {
    setConfirmDialog({
      message: t('menuManagement.confirmDeleteProductMessage'),
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteDoc(doc(db, 'products', id));
        } catch (err) {
          console.error('Failed to delete product:', err);
        } finally {
          setIsDeleting(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleCategoryReorder = (newOrder: Category[]) => {
    isDragging.current = true;
    setCategories(newOrder);
    // Store latest order for drag end
    dragCategoriesRef.current = newOrder;
  };

  const handleCategoryDragEnd = async () => {
    try {
      const batch = writeBatch(db);
      const currentCategories = dragCategoriesRef.current.length ? dragCategoriesRef.current : categoriesRef.current;
      currentCategories.forEach((cat, index) => {
        batch.update(doc(db, 'categories', cat.id), { order: index });
      });
      await batch.commit();
      // Drag operation finished, allow snapshots to resume immediately
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
      isDragging.current = false;
    } catch (err) {
      console.error('Category reorder failed:', err);
    }
  };

  const handleProductReorder = (newOrder: Product[]) => {
    if (!activeCategory) return;
    isDragging.current = true;
    setProducts(prev => {
      const otherProducts = prev.filter(p => p.categoryId !== activeCategory);
      return [...otherProducts, ...newOrder];
    });
    // Store latest order for drag end
    dragProductsRef.current = newOrder;
  };

  const handleProductDragEnd = async () => {
    try {
      const batch = writeBatch(db);
      const currentProducts = dragProductsRef.current.length ? dragProductsRef.current : productsRef.current;
      const activeProducts = currentProducts.filter(p => p.categoryId === activeCategory);
      activeProducts.forEach((prod, index) => {
        batch.update(doc(db, 'products', prod.id), { order: index });
      });
      await batch.commit();
      // Drag operation finished, allow snapshots to resume immediately
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
      isDragging.current = false;
    } catch (err) {
      console.error('Product reorder failed:', err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Categories Sidebar */}
      <div className="w-full md:w-72 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t('menuManagement.categories')}</h3>
          <button
            onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
            className="p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100 transition-all"
          >
            <FolderPlus size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {categories.length > 0 ? (
            <Reorder.Group axis="y" values={categories} onReorder={handleCategoryReorder} className="space-y-2">
              {categories.map(cat => (
                <DraggableCategoryItem
                  key={cat.id}
                  cat={cat}
                  isActive={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  onEdit={() => { setEditingCategory(cat); setShowCategoryModal(true); }}
                  onDelete={() => handleDeleteCategory(cat.id)}
                  onDragEnd={() => handleCategoryDragEnd()}
                />
              ))}
            </Reorder.Group>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8 bg-white rounded-3xl border border-dashed border-gray-200">{t('menuManagement.noCategories')}</p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {categories.find(c => c.id === activeCategory)?.name || t('menuManagement.products')}
          </h3>
          <button
            disabled={!activeCategory}
            onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-200"
          >
            <Plus size={18} /> {t('menuManagement.addProduct')}
          </button>
        </div>

        {activeCategory && filteredProducts.length > 0 ? (
          <Reorder.Group axis="y" values={filteredProducts} onReorder={(newOrder) => handleProductReorder(newOrder)} className="flex flex-col gap-3">
            {filteredProducts.map(prod => (
              <DraggableProductItem
                key={prod.id}
                prod={prod}
                getProductDisplayPrice={getProductDisplayPrice}
                onEdit={() => { setEditingProduct(prod); setShowProductModal(true); }}
                onDelete={() => handleDeleteProduct(prod.id)}
                onDragEnd={() => handleProductDragEnd()}
              />
            ))}
          </Reorder.Group>
        ) : activeCategory ? (
          <div className="col-span-full bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
            <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
              <ImageIcon className="text-orange-500 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('menuManagement.emptyCategoryTitle')}</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              {t('menuManagement.emptyCategoryDescription')}
            </p>
            <button
              onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
              className="flex min-h-[44px] items-center justify-center gap-2 bg-orange-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <Plus size={20} /> {t('menuManagement.addProduct')}
            </button>
          </div>
        ) : (
          <div className="col-span-full bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400 text-lg">{t('menuManagement.selectOrCreateCategory')}</p>
          </div>
        )}
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
          categories={categories}
          editing={editingProduct}
          onClose={() => setShowProductModal(false)}
        />
      )}

      {/* Custom Confirm Modal — replaces window.confirm() which is blocked by some browsers */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('menuManagement.confirmDeleteTitle')}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{confirmDialog.message}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  {t('menuManagement.cancel')}
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><Loader2 size={16} className="animate-spin" /> {t('menuManagement.deleting')}</>
                  ) : (
                    t('menuManagement.delete')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryModal({ storeId, editing, onClose }: { storeId: string, editing: Category | null, onClose: () => void }) {
  const { t } = useTranslation();
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
        // Fetch current categories to determine the next order value
        const q = query(collection(db, 'categories'), where('restaurantId', '==', storeId));
        const snap = await getDocs(q);
        const maxOrder = snap.docs.reduce((max, d) => {
          const order = Number(d.data().order) || 0;
          return order > max ? order : max;
        }, -1);

        await addDoc(collection(db, 'categories'), {
          name,
          order: maxOrder + 1,
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
          <h3 className="text-xl font-bold">{editing ? t('menuManagement.editCategory') : t('menuManagement.addCategory')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('menuManagement.categoryName')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('menuManagement.categoryNamePlaceholder')}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {loading ? t('menuManagement.saving') : t('menuManagement.saveCategory')}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductModal({ user, storeId, categoryId, categories, currency, editing, onClose }: { user: User, storeId: string, categoryId: string, categories: Category[], currency: 'EUR' | 'USD' | 'VND', editing: Product | null, onClose: () => void }) {
  const { t } = useTranslation();
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
    categoryId: string;
  }>({
    name: editing?.name || '',
    shortDescription: typeof editing?.shortDescription === 'string' ? editing.shortDescription : '',
    longDescription: typeof editing?.longDescription === 'string' ? editing.longDescription : '',
    price: normalizedInitialPrice,
    hashtags: initialHashtags,
    variants: initialVariants,
    imageUrl: typeof editing?.imageUrl === 'string' ? editing.imageUrl : '',
    categoryId: editing?.categoryId || categoryId
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
      alert(`${t('menuManagement.uploadImageError')} ${getStorageSetupHint()}`);
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
      alert(t('menuManagement.invalidPriceAlert'));
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
        categoryId: formData.categoryId,
        storeId,
        restaurantId: storeId,
        updatedAt: new Date().toISOString()
      };

      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), data);
      } else {
        const q = query(collection(db, 'products'), where('categoryId', '==', formData.categoryId));
        const snap = await getDocs(q);
        const maxOrder = snap.docs.reduce((max, d) => {
          const order = Number(d.data().order) || 0;
          return order > max ? order : max;
        }, -1);

        await addDoc(collection(db, 'products'), {
          ...data,
          order: maxOrder + 1,
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
            <h3 className="text-xl font-bold">{editing ? t('menuManagement.editProduct') : t('menuManagement.addProduct')}</h3>
            <p className="text-xs text-gray-500 mt-1">{t('menuManagement.currentStoreCurrency')}: <span className="font-semibold text-orange-600">{currency}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('menuManagement.productName')} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('menuManagement.productNamePlaceholder')}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('menuManagement.category')} <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('menuManagement.shortDescription')}</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder={t('menuManagement.shortDescriptionPlaceholder')}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('menuManagement.longDescription')}</label>
                <textarea
                  rows={3}
                  value={formData.longDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                  placeholder={t('menuManagement.longDescriptionPlaceholder')}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              {!hasVariants && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('menuManagement.price')} <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step={currency === 'VND' ? 1 : 0.01}
                    min={0}
                    inputMode={currency === 'VND' ? 'numeric' : 'decimal'}
                    required
                    value={priceInput}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
                    placeholder={t('menuManagement.pricePlaceholder', { currency, example: currency === 'VND' ? '45000' : '45.00' })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {priceInput
                      ? t('menuManagement.displayPrice', { price: formatCurrency(Number(priceInput)) })
                      : t('menuManagement.emptyPriceHint')}
                  </p>
                </div>
              )}
              {hasVariants && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  {t('menuManagement.variantPricingNotice')}
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('menuManagement.productImage')}</label>
                <div className="space-y-4">
                  <div className="w-full h-48 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200 relative">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt={t('menuManagement.previewImageAlt')} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                    <Upload size={16} /> {t('menuManagement.uploadImage')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100">
            <h4 className="font-bold mb-3">{t('menuManagement.hashtags')}</h4>
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
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  addHashtag();
                }}
                placeholder={t('menuManagement.hashtagPlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={addHashtag}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
              >{t('menuManagement.add')}</button>
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
                <h4 className="font-bold">{t('menuManagement.variants')}</h4>
                <p className="text-xs text-gray-500">{t('menuManagement.currencyApplied')}: {currency}</p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all"
              >
                {t('menuManagement.addVariant')}
              </button>
            </div>
            {formData.variants.length === 0 && <p className="text-xs text-gray-400">{t('menuManagement.noVariants')}</p>}
            <div className="space-y-3">
              {formData.variants.map((variant) => (
                <div key={variant.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-2xl border border-gray-200 bg-gray-50 p-2.5">
                  <input
                    className="sm:col-span-5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={variant.name}
                    onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                    placeholder={t('menuManagement.variantNamePlaceholder')}
                  />
                  <input
                    className="sm:col-span-4 px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    placeholder={t('menuManagement.variantPricePlaceholder', { currency })}
                  />
                  <button
                    type="button"
                    aria-pressed={variant.isDefault || false}
                    className={`sm:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold border transition-all ${(variant.isDefault || false)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-700'
                      }`}
                    onClick={() => setVariantDefault(variant.id)}
                  >
                    {variant.isDefault ? <Check size={14} /> : <span className="h-3.5 w-3.5 rounded-full border border-current" />}
                    {t('menuManagement.defaultVariant')}
                  </button>
                  <button
                    type="button"
                    className="sm:col-span-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 font-bold justify-self-end hover:bg-red-50"
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
            {loading ? t('menuManagement.saving') : t('menuManagement.saveProduct')}
          </button>
        </form>
      </div>
    </div>
  );
}
