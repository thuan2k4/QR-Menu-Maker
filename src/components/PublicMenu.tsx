import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db, logEvent } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Store, Category, Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Info, MapPin, Phone, X } from 'lucide-react';
import { getMenuTemplateById } from '../constants/menuTemplates';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const lastMenuViewKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (slug) {
      let unsubscribeCategories: (() => void) | null = null;
      let unsubscribeProducts: (() => void) | null = null;

      const fetchStore = async () => {
        const q = query(collection(db, 'restaurants'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const storeData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Store;
          setStore(storeData);

          // Fetch categories and products
          const catQuery = query(collection(db, 'categories'), where('restaurantId', '==', storeData.id));
          const prodQuery = query(collection(db, 'products'), where('restaurantId', '==', storeData.id));

          unsubscribeCategories = onSnapshot(catQuery, (catSnap) => {
            const cats = catSnap.docs
              .map(d => ({ id: d.id, ...d.data() } as Category))
              .sort((a, b) => a.order - b.order);
            setCategories(cats);
            if (cats.length > 0) setActiveCategory(cats[0].id);
          }, (error) => {
            console.error('Failed to subscribe public categories snapshot:', error);
          });

          unsubscribeProducts = onSnapshot(prodQuery, (prodSnap) => {
            setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
          }, (error) => {
            console.error('Failed to subscribe public products snapshot:', error);
          });
        }
        setLoading(false);
      };
      fetchStore();

      return () => {
        unsubscribeCategories?.();
        unsubscribeProducts?.();
      };
    }
  }, [slug]);

  useEffect(() => {
    if (!store || !slug) return;

    const menuVisibility = store.menuVisibility || 'private';
    const isOwner = !!currentUserId && currentUserId === store.ownerId;

    // Chỉ tính lượt xem khi khách hàng public-user truy cập QR (không tính owner-preview)
    if (menuVisibility !== 'public' || isOwner) return;

    const viewerType = 'public-user';
    const eventKey = `${store.id}:${slug}:${viewerType}`;
    if (lastMenuViewKeyRef.current === eventKey) return;

    lastMenuViewKeyRef.current = eventKey;
    void logEvent('menu_view', {
      storeId: store.id,
      slug: store.slug,
      menuVisibility,
      extra: {
        source: 'public_menu',
        viewerType,
      },
    });
  }, [store, slug, currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <Smartphone className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy Menu</h1>
        <p className="text-gray-500 mt-2">Vui lòng kiểm tra lại mã QR hoặc đường dẫn.</p>
      </div>
    );
  }

  const menuVisibility = store.menuVisibility || 'private';
  const isOwner = !!currentUserId && currentUserId === store.ownerId;

  if (menuVisibility !== 'public' && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <Info className="w-16 h-16 text-orange-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Menu đang trong trạng thái cập nhật, vui lòng quay lại sau.</h1>
      </div>
    );
  }

  const selectedTemplate = getMenuTemplateById(store.templateId);
  const primaryColor = store.primaryColor || store.themeColor || selectedTemplate.primaryColor;
  const secondaryColor = store.secondaryColor || selectedTemplate.secondaryColor;
  const currency = store.currency === 'EUR' || store.currency === 'USD' || store.currency === 'VND' ? store.currency : selectedTemplate.currency;
  const sizePreset = store.sizePreset === 'large' || store.sizePreset === 'compact' ? store.sizePreset : selectedTemplate.sizePreset;
  const fontFamily = store.fontFamily === 'Roboto' || store.fontFamily === 'Playfair Display' || store.fontFamily === 'Be Vietnam Pro' ? store.fontFamily : selectedTemplate.fontFamily;
  const fontFamilyMap: Record<string, string> = {
    Inter: 'Inter, Segoe UI, sans-serif',
    Roboto: 'Roboto, Segoe UI, sans-serif',
    'Playfair Display': 'Playfair Display, Georgia, serif',
    'Be Vietnam Pro': 'Be Vietnam Pro, Segoe UI, sans-serif',
  };
  const sizePresetClasses = {
    compact: {
      storeTitle: 'text-xl',
      productName: 'text-sm',
      productDescription: 'text-[11px]',
      price: 'text-base',
      modalTitle: 'text-xl',
      modalPrice: 'text-xl',
      modalDescription: 'text-sm',
      closeButton: 'text-base',
    },
    normal: {
      storeTitle: 'text-2xl',
      productName: 'text-base',
      productDescription: 'text-xs',
      price: 'text-lg',
      modalTitle: 'text-2xl',
      modalPrice: 'text-2xl',
      modalDescription: 'text-base',
      closeButton: 'text-lg',
    },
    large: {
      storeTitle: 'text-3xl',
      productName: 'text-lg',
      productDescription: 'text-sm',
      price: 'text-xl',
      modalTitle: 'text-3xl',
      modalPrice: 'text-3xl',
      modalDescription: 'text-lg',
      closeButton: 'text-xl',
    },
  };
  const typography = sizePresetClasses[sizePreset];
  const layoutSpacingMap = {
    stacked: 'space-y-4',
    editorial: 'space-y-6',
    split: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  };
  const productListClass = layoutSpacingMap[selectedTemplate.layout];
  const isSplitLayout = selectedTemplate.layout === 'split';
  const isEditorialLayout = selectedTemplate.layout === 'editorial';
  const productCardShapeClass = isEditorialLayout ? 'rounded-3xl' : 'rounded-2xl';
  const productCardSurfaceClass = selectedTemplate.cardStyle === 'outline'
    ? 'border-2 shadow-none'
    : selectedTemplate.cardStyle === 'solid'
      ? 'border shadow-md'
      : 'border shadow-sm hover:shadow-md';
  const productCardInlineStyle = selectedTemplate.cardStyle === 'outline'
    ? { borderColor: `${primaryColor}55` }
    : selectedTemplate.cardStyle === 'solid'
      ? { backgroundColor: secondaryColor, borderColor: `${primaryColor}22` }
      : undefined;
  const rootStyle = selectedTemplate.backgroundStyle === 'solid'
    ? { backgroundColor: secondaryColor, fontFamily: fontFamilyMap[fontFamily] }
    : selectedTemplate.backgroundStyle === 'duotone'
      ? { backgroundColor: secondaryColor, backgroundImage: `linear-gradient(180deg, ${secondaryColor} 0%, #f8f8f8 52%, #ffffff 100%)`, fontFamily: fontFamilyMap[fontFamily] }
      : selectedTemplate.backgroundStyle === 'paper'
        ? { backgroundColor: secondaryColor, backgroundImage: `radial-gradient(circle at 0% 0%, #ffffff 0%, ${secondaryColor} 45%, #fffaf5 100%)`, fontFamily: fontFamilyMap[fontFamily] }
        : { backgroundColor: secondaryColor, backgroundImage: `linear-gradient(180deg, ${secondaryColor} 0%, #ffffff 72%)`, fontFamily: fontFamilyMap[fontFamily] };

  const formatCurrency = (value: number) => {
    const localeByCurrency: Record<'EUR' | 'USD' | 'VND', string> = {
      EUR: 'de-DE',
      USD: 'en-US',
      VND: 'vi-VN',
    };

    try {
      return new Intl.NumberFormat(localeByCurrency[currency], {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
      }).format(value);
    } catch {
      return `${value.toLocaleString('vi-VN')}đ`;
    }
  };

  const getProductDisplayPrice = (prod: Product) => {
    const variants = prod.variants || [];
    const validVariantPrices = variants
      .map((v) => Number(v.price))
      .filter((p) => !Number.isNaN(p));

    if (validVariantPrices.length > 0) {
      const min = Math.min(...validVariantPrices);
      const max = Math.max(...validVariantPrices);
      if (min === max) {
        return formatCurrency(min);
      }
      return `Từ ${formatCurrency(min)} - ${formatCurrency(max)}`;
    }

    return formatCurrency(prod.price || 0);
  };

  const getProductDetailDescription = (prod: Product) => {
    const longDescription = prod.longDescription?.trim();
    const legacyDescription = prod.description?.trim();
    const shortDescription = prod.shortDescription?.trim();
    return longDescription || legacyDescription || shortDescription || 'Không có mô tả cho sản phẩm này.';
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory)
    : [];

  const handleProductClick = (prod: Product) => {
    setSelectedProduct(prod);
    void logEvent('product_detail_click', {
      storeId: store.id,
      productId: prod.id,
      slug: store.slug,
      menuVisibility,
      extra: {
        source: 'public_menu',
        categoryId: prod.categoryId,
        viewerType: isOwner ? 'owner-preview' : 'public-user',
      },
    });
  };

  return (
    <div className="min-h-screen pb-20 overflow-y-auto" style={rootStyle}>
      {/* Cover Image */}
      <div className="h-48 md:h-64 w-full relative overflow-hidden">
        {store.coverUrl ? (
          <img src={store.coverUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-orange-500" style={{ backgroundColor: primaryColor }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Store Info */}
      <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0 -mt-16">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-xl">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`${typography.storeTitle} font-bold text-gray-900 truncate`}>{store.name}</h1>
              <div className="flex flex-col gap-1 mt-1">
                {store.address && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={12} style={{ color: primaryColor }} />
                    {store.address}
                  </p>
                )}
                {store.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone size={12} style={{ color: primaryColor }} />
                    {store.phone}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{store.bio}</p>
              {menuVisibility !== 'public' && isOwner && (
                <div className="mt-4 rounded-2xl bg-orange-50 border border-orange-100 text-orange-700 text-sm font-medium px-4 py-3">
                  Menu đang ở chế độ Riêng tư (private). Chỉ bạn mới có thể xem xem trước.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="max-w-2xl mx-auto px-6 mt-6 py-8 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-gray-500">
          <p className="font-semibold text-gray-700">Menu của quán vẫn đang trống</p>
          <p className="mt-2 text-sm leading-relaxed">Chưa có danh mục hoặc sản phẩm nào. Chủ cửa hàng cần vào quản trị để thêm danh mục và sản phẩm.</p>
        </div>
      )}

      {categories.length > 0 && (
        <>
          {/* Categories Horizontal Scroll */}
          <div className="sticky top-0 backdrop-blur-sm z-20 mt-6">
            <div className="max-w-2xl mx-auto px-4 py-3 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 shadow-sm overflow-hidden">
              <div className={`flex items-center overflow-x-auto no-scrollbar whitespace-nowrap gap-3 px-1`}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap text-sm font-bold transition-all duration-200 ${selectedTemplate.navStyle === 'underline'
                      ? `px-3 py-2 rounded-full ${activeCategory === cat.id ? 'text-white bg-gradient-to-r from-orange-500 to-pink-500 border-0' : 'text-gray-600 bg-white/80 border border-gray-100'}`
                      : selectedTemplate.navStyle === 'block'
                        ? `px-5 py-2.5 rounded-full ${activeCategory === cat.id ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-500' : 'text-gray-600 bg-gray-100 border border-gray-200'}`
                        : `px-5 py-2.5 rounded-full ${activeCategory === cat.id ? 'text-white bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg' : 'text-gray-600 bg-white/85 border border-gray-200'}`
                      }`}
                    style={{
                      transform: activeCategory === cat.id ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: activeCategory === cat.id ? `0 8px 20px -8px ${primaryColor}66` : undefined,
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="max-w-2xl mx-auto px-6 mt-8 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={productListClass}
              >
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className={`bg-white p-4 ${productCardShapeClass} ${productCardSurfaceClass} ${isSplitLayout ? 'flex flex-col gap-3' : 'flex gap-4'} transition-all cursor-pointer active:scale-[0.98]`}
                    style={productCardInlineStyle}
                  >
                    <div className={`${isSplitLayout ? 'w-full h-40 rounded-2xl' : 'w-24 h-24 rounded-xl flex-shrink-0'} bg-gray-50 overflow-hidden border border-gray-50`}>
                      {prod.imageUrl ? (
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <Smartphone size={24} />
                        </div>
                      )}
                    </div>
                    <div className={`flex-1 flex flex-col justify-between ${isSplitLayout ? 'py-0' : 'py-1'} min-w-0`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className={`${typography.productName} font-bold text-gray-900 line-clamp-2 break-words pr-2 leading-snug`}>{prod.name}</h3>
                        </div>
                        <p className={`${typography.productDescription} text-gray-400 line-clamp-2 mt-1 leading-relaxed`}>{prod.shortDescription || prod.longDescription || prod.description}</p>
                        {prod.hashtags && prod.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {prod.hashtags.slice(0, 5).map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className={`${typography.price} font-bold block break-words leading-tight`} style={{ color: primaryColor }}>
                          {getProductDisplayPrice(prod)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-20 text-gray-400">
                    <p>Chưa có món ăn nào trong danh mục này</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-x-0 bottom-0 max-w-2xl mx-auto bg-white z-[70] ${isEditorialLayout ? 'rounded-t-[24px]' : 'rounded-t-[40px]'} overflow-hidden shadow-2xl max-h-[90vh]`}
            >
              <div className="flex flex-col h-full">
                <div className="relative h-[32vh] md:h-72 lg:h-96 min-h-[220px] flex-shrink-0">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                      <Smartphone size={64} />
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-900 shadow-lg"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 md:p-8 flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 32vh)' }}>
                  <div className="mb-4 space-y-3">
                    <div className="min-w-0">
                      <h2 className={`${typography.modalTitle} font-bold text-gray-900 break-words leading-tight`}>{selectedProduct.name}</h2>
                      {selectedProduct.shortDescription ? (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{selectedProduct.shortDescription}</p>
                      ) : null}
                    </div>
                    <div className="inline-flex w-full md:w-auto flex-col rounded-2xl border border-gray-100 px-4 py-3 bg-gray-50">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Mức giá</span>
                      <span className={`${typography.modalPrice} font-bold break-words leading-tight mt-1`} style={{ color: primaryColor }}>
                        {getProductDisplayPrice(selectedProduct)}
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-gray-100 w-full mb-6" />
                  {selectedProduct.hashtags && selectedProduct.hashtags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {selectedProduct.hashtags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400">Mô tả</h4>
                    <p className={`${typography.modalDescription} text-gray-600 leading-relaxed`}>
                      {getProductDetailDescription(selectedProduct)}
                    </p>
                  </div>
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400">Variants</h4>
                      <ul className="mt-2 space-y-2">
                        {[...selectedProduct.variants].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((variant) => (
                          <li key={variant.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-100">
                            <span className="break-words">{variant.name || 'Tên variant'}</span>
                            <span className="break-words">{formatCurrency(Number(variant.price) || 0)} {variant.isDefault ? '(Mặc định)' : ''}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className={`w-full mt-10 py-4 ${selectedTemplate.navStyle === 'underline' ? 'rounded-lg' : 'rounded-2xl'} text-white font-bold ${typography.closeButton} shadow-lg`}
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 10px 20px -5px ${primaryColor}40`
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="max-w-2xl mx-auto px-4 mt-12 text-center">
        <div className="h-px bg-gray-200 w-24 mx-auto mb-6" />
        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Cung cấp bởi MenuQRGenerate</p>
      </div>
    </div>
  );
}
