import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { Store, Category, Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Info, MapPin, Phone, ShoppingBag, X } from 'lucide-react';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchStore = async () => {
        const q = query(collection(db, 'restaurants'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const storeData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Store;
          setStore(storeData);

          // Fetch categories and products
          const catQuery = query(collection(db, 'categories'), where('restaurantId', '==', storeData.id));
          const prodQuery = query(collection(db, 'products'), where('restaurantId', '==', storeData.id));

          onSnapshot(catQuery, (catSnap) => {
            const cats = catSnap.docs
              .map(d => ({ id: d.id, ...d.data() } as Category))
              .sort((a, b) => a.order - b.order);
            setCategories(cats);
            if (cats.length > 0) setActiveCategory(cats[0].id);
          }, (error) => {
            console.error('Failed to subscribe public categories snapshot:', error);
          });

          onSnapshot(prodQuery, (prodSnap) => {
            setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
          }, (error) => {
            console.error('Failed to subscribe public products snapshot:', error);
          });
        }
        setLoading(false);
      };
      fetchStore();
    }
  }, [slug]);

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

  const themeColor = store.primaryColor || store.themeColor || '#f97316';

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Cover Image */}
      <div className="h-48 md:h-64 w-full relative overflow-hidden">
        {store.coverUrl ? (
          <img src={store.coverUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-orange-500" style={{ backgroundColor: themeColor }} />
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
              <h1 className="text-2xl font-bold text-gray-900 truncate">{store.name}</h1>
              <div className="flex flex-col gap-1 mt-1">
                {store.address && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={12} style={{ color: themeColor }} />
                    {store.address}
                  </p>
                )}
                {store.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone size={12} style={{ color: themeColor }} />
                    {store.phone}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{store.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="sticky top-0 bg-gray-50/80 backdrop-blur-md z-20 mt-6 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === cat.id
                ? 'text-white shadow-lg'
                : 'bg-white text-gray-500 border border-gray-100'
                }`}
              style={{
                backgroundColor: activeCategory === cat.id ? themeColor : undefined,
                boxShadow: activeCategory === cat.id ? `0 10px 15px -3px ${themeColor}40` : undefined
              }}
            >
              {cat.name}
            </button>
          ))}
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
            className="space-y-4"
          >
            {filteredProducts.map(prod => (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className="bg-white p-4 rounded-2xl flex gap-4 border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <Smartphone size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 truncate pr-2">{prod.name}</h3>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">{prod.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold" style={{ color: themeColor }}>
                      {prod.price.toLocaleString('vi-VN')}đ
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
              className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white z-[70] rounded-t-[40px] overflow-hidden shadow-2xl"
            >
              <div className="relative h-72 md:h-96">
                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                    <Smartphone size={64} />
                  </div>
                )}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-900 shadow-lg"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 pr-4">{selectedProduct.name}</h2>
                  <span className="text-2xl font-bold whitespace-nowrap" style={{ color: themeColor }}>
                    {selectedProduct.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="h-px bg-gray-100 w-full mb-6" />
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400">Mô tả chi tiết</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProduct.description || 'Không có mô tả cho sản phẩm này.'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-full mt-10 py-4 rounded-2xl text-white font-bold text-lg shadow-lg"
                  style={{
                    backgroundColor: themeColor,
                    boxShadow: `0 10px 20px -5px ${themeColor}40`
                  }}
                >
                  Đóng
                </button>
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
