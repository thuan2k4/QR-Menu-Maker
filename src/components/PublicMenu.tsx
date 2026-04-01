import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { Restaurant, Category, Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Info, MapPin, Phone, ChevronRight } from 'lucide-react';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const fetchRestaurant = async () => {
        const q = query(collection(db, 'restaurants'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const resData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Restaurant;
          setRestaurant(resData);

          // Fetch categories and products
          const catQuery = query(collection(db, 'categories'), where('restaurantId', '==', resData.id), orderBy('order', 'asc'));
          const prodQuery = query(collection(db, 'products'), where('restaurantId', '==', resData.id));

          onSnapshot(catQuery, (catSnap) => {
            const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
            setCategories(cats);
            if (cats.length > 0) setActiveCategory(cats[0].id);
          });

          onSnapshot(prodQuery, (prodSnap) => {
            setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
          });
        }
        setLoading(false);
      };
      fetchRestaurant();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <Smartphone className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy Menu</h1>
        <p className="text-gray-500 mt-2">Vui lòng kiểm tra lại mã QR hoặc đường dẫn.</p>
      </div>
    );
  }

  const filteredProducts = activeCategory 
    ? products.filter(p => p.categoryId === activeCategory)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Cover Image */}
      <div className="h-48 md:h-64 w-full relative overflow-hidden">
        {restaurant.coverUrl ? (
          <img src={restaurant.coverUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-orange-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Restaurant Info */}
      <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0 -mt-16">
              {restaurant.logoUrl ? (
                <img src={restaurant.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-xl">
                  {restaurant.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{restaurant.name}</h1>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{restaurant.bio}</p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-4 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-1"><MapPin size={14} /> Tại chỗ</div>
            <div className="flex items-center gap-1"><Phone size={14} /> Liên hệ</div>
            <div className="flex items-center gap-1"><Info size={14} /> Thông tin</div>
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
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-white text-gray-500 border border-gray-100'
              }`}
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
                className={`bg-white p-4 rounded-2xl flex gap-4 border border-gray-100 shadow-sm transition-all ${!prod.isAvailable ? 'opacity-60 grayscale' : ''}`}
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
                      {!prod.isAvailable && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">Hết</span>}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">{prod.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-orange-500 font-bold">{prod.price.toLocaleString('vi-VN')}đ</span>
                    <button className="p-1.5 bg-orange-50 text-orange-500 rounded-lg">
                      <ChevronRight size={16} />
                    </button>
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

      {/* Floating Action (Optional) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-6">
        <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-2 hover:bg-black transition-all">
          <Smartphone size={18} /> Gọi nhân viên
        </button>
      </div>
    </div>
  );
}
