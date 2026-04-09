import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useMenuContext } from '../../MenuProvider';
import ProductVibrantCard from './ProductVibrantCard';
import { useRef } from 'react';
import PrivatePreviewInlineNotice from '../../PrivatePreviewInlineNotice';
import { useTranslation } from '../../../../i18n';

export default function TemplateVibrant() {
  const { t } = useTranslation();
  const {
    filteredProducts,
    categories,
    activeCategory,
    setActiveCategory,
    store,
    bgColor,
    selectedProduct,
    clearSelectedProduct,
    getProductDisplayPrice,
    getProductDetailDescription,
    formatCurrency,
  } = useMenuContext();

  const scrollContainer = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
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
          className="relative mx-auto max-w-2xl px-6 -mt-24 mb-10 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
        >
          <div className="rounded-[2.5rem] bg-white shadow-2xl overflow-hidden border-4 border-orange-100 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-orange-50/50 to-white p-8">
              <div className="flex flex-col items-center text-center gap-6">
                {/* Logo */}
                <motion.div
                  className="flex-shrink-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                >
                  <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-orange-500 bg-white shadow-xl flex items-center justify-center ring-8 ring-orange-50">
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
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.25em] mb-2 px-4 py-1.5 bg-orange-50 rounded-full inline-block">✨ {t('menuUi.welcomeTo')}</p>
                    <h1 className="text-3xl font-black text-gray-900 leading-tight">{store?.name || 'Menu'}</h1>
                  </div>
                  <div className="flex flex-col items-center gap-2.5 text-sm font-bold">
                    {store?.address && (
                      <p className="flex items-center gap-2 text-gray-800 bg-gray-50 px-4 py-2 rounded-2xl w-full justify-center">
                        <span className="text-lg">📍</span>{store.address}
                      </p>
                    )}
                    {store?.phone && (
                      <p className="flex items-center gap-2 text-gray-800 bg-gray-50 px-4 py-2 rounded-2xl w-full justify-center">
                        <span className="text-lg">☎️</span> {store.phone}
                      </p>
                    )}
                  </div>
                  {store?.bio && (
                    <p className="text-gray-500 leading-relaxed font-medium text-sm pt-2">{store.bio}</p>
                  )}
                  <PrivatePreviewInlineNotice className="border-orange-100 bg-orange-50/50 text-orange-700 mx-auto" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categories Toolbar */}
      <div className="sticky top-0 z-30 mb-8 mt-2">
        <div className="mx-auto max-w-2xl px-6">
          <motion.div
            className="bg-white/80 backdrop-blur-2xl rounded-[2rem] border-2 border-orange-50 shadow-lg p-2 flex items-center overflow-x-auto no-scrollbar gap-2 relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex-shrink-0 whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-500 hover:text-orange-600'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="vibrantActivePill"
                      className="absolute inset-0 z-0 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{cat.name}</span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-6 pb-12">
        {/* Products Grid */}
        <div>

          {filteredProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
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
                {t('menuUi.noProductsTitle')}
              </p>
              <p className="text-orange-600 mt-2 text-sm">{t('menuUi.noProductsDescription')}</p>
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
                className="relative w-full max-h-[90vh] sm:max-w-2xl max-w-lg rounded-t-4xl sm:rounded-4xl bg-white shadow-2xl overflow-y-auto flex flex-col border-4 border-orange-200"
                layoutId="product-modal"
              >
                {/* Close Button */}
                <motion.button
                  onClick={clearSelectedProduct}
                  aria-label={t('menuUi.close')}
                  className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-orange-200 bg-white/95 text-orange-600 shadow-lg transition-all hover:bg-orange-50"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
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
                        📝 {t('menuUi.descriptionLabel')}
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
                        🎨 {t('menuUi.optionsLabel')}
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
                                    {t('menuUi.defaultVariant')}
                                  </motion.span>
                                )}
                              </label>
                            </div>
                            {variant.price && (
                              <span className="font-black text-lg text-orange-600">
                                +{formatCurrency(variant.price || 0)}
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
                    {t('menuUi.close')}
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
