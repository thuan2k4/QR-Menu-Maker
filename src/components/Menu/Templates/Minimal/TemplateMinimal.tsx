import { AnimatePresence, motion } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { useMenuContext } from '../../MenuProvider';
import { useRef, useState, useEffect } from 'react';
import PrivatePreviewInlineNotice from '../../PrivatePreviewInlineNotice';

export default function TemplateMinimal() {
  const {
    filteredProducts,
    store,
    activeCategory,
    setActiveCategory,
    selectedProduct,
    clearSelectedProduct,
    selectProduct,
    getProductDisplayPrice,
    getProductDetailDescription,
    categories,
  } = useMenuContext();

  const [isMobile, setIsMobile] = useState(false);
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Cover Image */}
      {store?.coverUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-100"
        >
          <img
            src={store.coverUrl}
            alt="Cover"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        </motion.div>
      )}

      {/* Header - Minimal */}
      <div className="border-b border-slate-200 pb-8 pt-8 px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="space-y-6">
            {/* Logo + Name */}
            <div className="flex items-start gap-6">
              {store?.logoUrl && (
                <img
                  src={store.logoUrl}
                  alt="Logo"
                  className="h-20 w-20 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                  {store?.name || 'Store'}
                </h1>
                <p className="text-sm text-slate-600 font-medium mt-2 max-w-md leading-relaxed">
                  {store?.bio}
                </p>
                {(store?.address || store?.phone) && (
                  <div className="flex flex-wrap gap-6 text-sm text-slate-700 mt-4 font-medium">
                    {store?.address && <span>📍 {store.address}</span>}
                    {store?.phone && <span>☎️ {store.phone}</span>}
                  </div>
                )}
                <PrivatePreviewInlineNotice className="border-slate-300 bg-slate-100 text-slate-700" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex flex-col w-52 border-r border-slate-200 py-8 px-6 bg-slate-50 overflow-y-auto"
        >
          <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 mb-6">
            Danh Mục
          </p>
          <div className="space-y-2">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-700 hover:bg-slate-200'
                  }`}
                whileHover={{ scale: 1.02, paddingLeft: 20 }}
                whileTap={{ scale: 0.98 }}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Products - Main Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile Category Pills */}
          <div className="lg:hidden sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 mb-3">
              Danh Mục
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="px-6 sm:px-8 lg:px-12 py-8 max-w-4xl mx-auto">
            {filteredProducts.length > 0 ? (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    className="group cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => selectProduct(product)}
                  >
                    <motion.div
                      onClick={() => selectProduct(product)}
                      className="flex gap-6 p-6 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all bg-white"
                      whileHover={{ y: -2 }}
                    >
                      {/* Image */}
                      {product.imageUrl && (
                        <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        {/* Name & Description */}
                        <div>
                          <h3 className="text-lg font-black text-gray-900">
                            {product.name}
                          </h3>
                          {product.shortDescription || product.description ? (
                            <p className="text-sm text-slate-600 font-medium mt-2 line-clamp-2">
                              {product.shortDescription?.trim() || product.description?.trim()}
                            </p>
                          ) : null}

                          {/* Hashtags */}
                          {product.hashtags && product.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {product.hashtags.slice(0, 4).map((tag: string, ix: number) => (
                                <span key={ix} className="text-xs text-indigo-600 font-bold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Variants */}
                          {product.variants && product.variants.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {product.variants.slice(0, 3).map((variant, vi) => (
                                <span key={vi} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                                  {variant.name} <span className="text-indigo-600">+{((variant.price || 0) - (product.price || 0)).toLocaleString()}đ</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer - Price + ChevronRight */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-2xl font-black text-indigo-600">
                            {getProductDisplayPrice(product)}
                          </div>
                          <ChevronRight size={24} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-slate-600 font-bold text-lg">
                  Không có sản phẩm
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Hãy chọn một danh mục khác
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal - Desktop: Center | Mobile: Bottom Sheet */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={clearSelectedProduct}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onDragStart={(_, info) => {
                dragStartY.current = info.offset.y;
              }}
              onDrag={(_, info) => {
                dragCurrentY.current = info.offset.y;
              }}
              onDragEnd={(_, info) => {
                // On mobile, close if dragged down more than 50px
                if (isMobile && info.offset.y > 50) {
                  clearSelectedProduct();
                }
              }}
              drag={isMobile ? 'y' : false}
              dragElastic={{ top: 0, bottom: 0.2 }}
              dragConstraints={{ top: 0, bottom: 300 }}
              className={`fixed z-50 flex items-end sm:items-center justify-center w-full ${isMobile ? 'inset-0 p-0' : 'inset-0 p-4 sm:p-6'
                }`}
            >
              <motion.div
                className={`w-full bg-white shadow-2xl ${isMobile
                  ? 'rounded-t-3xl max-h-[85vh] overflow-y-auto'
                  : 'max-w-md max-h-[90vh] overflow-y-auto rounded-2xl'
                  }`}
              >
                {/* Drag Handle Bar - Mobile Only */}
                {isMobile && (
                  <div className="sticky top-0 flex justify-center pt-3 pb-2 bg-white rounded-t-3xl">
                    <div className="w-12 h-1 rounded-full bg-slate-300" />
                  </div>
                )}

                {/* Image */}
                {selectedProduct.imageUrl && (
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <motion.button
                      onClick={clearSelectedProduct}
                      className="absolute top-4 right-4 rounded-full bg-white p-2 shadow-lg hover:bg-slate-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={20} className="text-slate-700" />
                    </motion.button>
                  </div>
                )}

                <div className={`${isMobile ? 'p-5 pb-8' : 'p-6'} space-y-6`}>
                  {/* Name & Price */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.2 }}
                  >
                    <h2 className={`font-black text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                      {selectedProduct.name}
                    </h2>
                    <div className={`font-black text-indigo-600 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                      {getProductDisplayPrice(selectedProduct)}
                    </div>
                  </motion.div>

                  {/* Hashtags */}
                  {selectedProduct.hashtags && selectedProduct.hashtags.length > 0 && (
                    <motion.div
                      className="flex flex-wrap gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                    >
                      {selectedProduct.hashtags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  {/* Description */}
                  {(selectedProduct.description || getProductDetailDescription(selectedProduct)) && (
                    <motion.div
                      className="space-y-3 pt-4 border-t border-slate-100"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.2 }}
                    >
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.1em]">
                        📝 Chi tiết
                      </h3>
                      <p className={`text-slate-600 leading-relaxed font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {getProductDetailDescription(selectedProduct) || selectedProduct.description}
                      </p>
                    </motion.div>
                  )}

                  {/* Variants */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <motion.div
                      className="space-y-4 pt-4 border-t border-slate-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.2 }}
                    >
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.1em]">
                        🎯 Tùy chọn
                      </h3>
                      <div className="space-y-2">
                        {selectedProduct.variants.map((variant, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-slate-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>{variant.name}</span>
                              {(variant.isDefault || idx === 0) ? (
                                <span className={`rounded-full bg-indigo-100 px-2 py-0.5 font-black text-indigo-700 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                                  Mặc định
                                </span>
                              ) : null}
                            </div>
                            <span className={`font-black text-indigo-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                              {(variant.price || 0).toLocaleString()}đ
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Close Button */}
                  <motion.button
                    onClick={clearSelectedProduct}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black text-sm uppercase tracking-[0.08em] shadow-lg mt-6"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.2 }}
                  >
                    {isMobile ? 'Xong' : 'Đóng'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
