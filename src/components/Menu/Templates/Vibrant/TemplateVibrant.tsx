import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useMenuContext } from '../../MenuProvider';
import ProductVibrantCard from './ProductVibrantCard';
import { useRef } from 'react';
import PrivatePreviewInlineNotice from '../../PrivatePreviewInlineNotice';

export default function TemplateVibrant() {
  const {
    filteredProducts,
    categories,
    activeCategory,
    setActiveCategory,
    store,
    selectedProduct,
    clearSelectedProduct,
    getProductDisplayPrice,
    getProductDetailDescription,
    formatCurrency,
  } = useMenuContext();

  const scrollContainer = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      {/* Header with Cover */}
      <div className="relative overflow-hidden">
        {store?.coverUrl ? (
          <motion.div
            className="relative h-48 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={store.coverUrl}
              alt="Cover"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-orange-600/30 to-orange-600/50" />
          </motion.div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700" />
        )}

        {/* Store Info Card - Enhanced */}
        <motion.div
          className="relative mx-auto max-w-6xl px-4 sm:px-6 -mt-24 mb-12 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
        >
          <div className="rounded-4xl bg-white shadow-2xl overflow-hidden border-4 border-orange-200 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-orange-50 to-white p-8">
              <div className="flex items-start gap-8">
                {/* Logo */}
                <motion.div
                  className="flex-shrink-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                >
                  <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-orange-500 bg-gradient-to-br from-orange-200 to-orange-100 shadow-xl flex items-center justify-center ring-4 ring-orange-100">
                    {store?.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-5xl font-black text-orange-600">
                        {store?.name?.charAt(0) || '🍔'}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Store Details */}
                <motion.div
                  className="flex-1 space-y-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                >
                  <div>
                    <p className="text-sm font-black text-orange-600 uppercase tracking-[0.2em]">✨ Welcome to</p>
                    <h1 className="text-4xl font-black text-gray-900 leading-tight mt-1">{store?.name || 'Menu'}</h1>
                  </div>
                  <div className="space-y-2.5 text-sm font-bold">
                    {store?.address && (
                      <p className="flex items-center gap-3 text-gray-800">
                        <span className="text-2xl">📍</span>{store.address}
                      </p>
                    )}
                    {store?.phone && (
                      <p className="flex items-center gap-3 text-gray-800">
                        <span className="text-2xl">☎️</span> {store.phone}
                      </p>
                    )}
                  </div>
                  {store?.bio && (
                    <p className="text-gray-700 leading-relaxed font-medium text-sm">{store.bio}</p>
                  )}
                  <PrivatePreviewInlineNotice className="border-orange-200 bg-orange-50 text-orange-700" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 space-y-10">
        {/* Scrollable Categories */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <p className="text-sm font-black text-orange-600 uppercase tracking-[0.15em]">
              📋 Our Menu
            </p>
            <h2 className="text-2xl font-black text-gray-900 mt-2">What are you craving today?</h2>
          </div>

          <div className="relative">
            <div
              ref={scrollContainer}
              className="flex gap-4 overflow-x-auto pb-3 scroll-smooth flex-nowrap"
              style={{ scrollBehavior: 'smooth' }}
            >
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3 rounded-full font-black text-sm whitespace-nowrap transition-all flex-shrink-0 translate-z-0 ${activeCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40'
                    : 'bg-white text-gray-700 border-2 border-orange-300 hover:border-orange-500 shadow-md hover:shadow-lg'
                    }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300 }}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div>
          {filteredProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {filteredProducts.map((product, idx) => (
                <ProductVibrantCard key={product.id} product={product} index={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="rounded-4xl border-4 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-white p-16 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-orange-700 font-black text-xl">
                Không có sản phẩm nào trong danh mục này
              </p>
              <p className="text-orange-600 mt-2 text-sm">Hãy chọn danh mục khác để khám phá menu</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={clearSelectedProduct}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            >
              <motion.div
                className="w-full max-h-[90vh] sm:max-w-2xl max-w-lg rounded-t-4xl sm:rounded-4xl bg-white shadow-2xl overflow-y-auto flex flex-col border-4 border-orange-200"
                layoutId="product-modal"
              >
                {/* Close Button */}
                <motion.button
                  onClick={clearSelectedProduct}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg hover:shadow-xl border-0 text-white transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>

                {/* Product Image */}
                <motion.div
                  className="relative h-72 bg-gradient-to-br from-orange-200 via-orange-100 to-orange-50 overflow-hidden flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {selectedProduct.imageUrl ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="h-full w-full object-contain object-center"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-9xl">🍔</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>

                {/* Content Section */}
                <motion.div
                  className="flex-1 p-8 space-y-6 overflow-y-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Name & Price */}
                  <div className="space-y-4 pb-6 border-b-4 border-orange-200">
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">
                      {selectedProduct.name}
                    </h2>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
                        {getProductDisplayPrice(selectedProduct)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {(selectedProduct.description || getProductDetailDescription(selectedProduct)) && (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <h3 className="text-sm font-black text-orange-600 uppercase tracking-[0.15em]">
                        📝 Mô tả
                      </h3>
                      <p className="text-gray-700 text-base leading-relaxed font-medium">
                        {getProductDetailDescription(selectedProduct) || selectedProduct.description}
                      </p>
                    </motion.div>
                  )}

                  {/* Hashtags */}
                  {selectedProduct.hashtags && selectedProduct.hashtags.length > 0 && (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.hashtags.map((tag: string, idx: number) => (
                          <span key={idx} className="text-sm text-gray-600 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Variants */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-sm font-black text-orange-600 uppercase tracking-[0.15em]">
                        🎨 Tùy chọn
                      </h3>
                      <div className="grid gap-3">
                        {selectedProduct.variants.map((variant: any, idx: number) => (
                          <motion.div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-white hover:border-orange-400 cursor-pointer transition-all shadow-sm hover:shadow-md"
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {/* <motion.input
                                type="radio"
                                name="variant"
                                defaultChecked={idx === 0}
                                readOnly
                                className="w-5 h-5 cursor-pointer accent-orange-500"
                                whileHover={{ scale: 1.2 }}
                              /> */}
                              <label className="flex-1 font-black text-gray-900">
                                {variant.name}
                                {idx === 0 && (
                                  <motion.span
                                    className="ml-3 text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full font-black"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                  >
                                    Mặc định
                                  </motion.span>
                                )}
                              </label>
                            </div>
                            {variant.price && (
                              <span className="font-black text-lg text-orange-600">
                                +{variant.price.toLocaleString()}đ
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Close Button */}
                  <motion.button
                    onClick={clearSelectedProduct}
                    className="w-full py-5 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-lg shadow-lg hover:shadow-xl transition-all border-0 flex items-center justify-center gap-3 mt-6"
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(249, 115, 22, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Đóng
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
