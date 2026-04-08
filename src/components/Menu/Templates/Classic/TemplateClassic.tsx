import { AnimatePresence, motion } from 'motion/react';
import { useMenuContext } from '../../MenuProvider';
import Header from './Header';
import CategoryList from './CategoryList';
import ProductCard from './ProductCard';
import { Smartphone, X, Info } from 'lucide-react';
import { useTranslation } from '../../../../i18n';

export default function TemplateClassic() {
  const { t } = useTranslation();
  const {
    store,
    categories,
    filteredProducts,
    selectedProduct,
    selectProduct,
    clearSelectedProduct,
    setActiveCategory,
    activeCategory,
    loading,
    menuVisibility,
    isOwner,
    typography,
    primaryColor,
    selectedTemplate,
    formatCurrency,
    getProductDisplayPrice,
    getProductDetailDescription,
    rootStyle,
  } = useMenuContext();

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
        <h1 className="text-2xl font-bold text-gray-900">{t('publicMenu.notFoundTitle')}</h1>
        <p className="text-gray-500 mt-2">{t('publicMenu.notFoundDescription')}</p>
      </div>
    );
  }

  if (menuVisibility !== 'public' && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
          <Info size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('publicMenu.privateNotice')}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 overflow-y-auto" style={rootStyle}>
      <div className="h-48 md:h-64 w-full relative overflow-hidden" style={{ borderRadius: selectedTemplate.cardStyle === 'solid' ? '32px' : '24px' }}>
        {store.coverUrl ? (
          <img src={store.coverUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: primaryColor }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <Header />
      <CategoryList />

      <div className="max-w-2xl mx-auto px-6 mt-8 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory || 'empty'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={selectedTemplate.layout === 'split' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p>{t('menuUi.noProductsTitle')}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => clearSelectedProduct()}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 max-w-2xl mx-auto bg-white z-[70] rounded-t-[32px] overflow-hidden shadow-2xl max-h-[90vh]"
            >
              <div className="flex flex-col h-full">
                <div className="relative h-[32vh] md:h-72 lg:h-96 min-h-[220px] flex-shrink-0">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-contain object-center" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                      <Smartphone size={64} />
                    </div>
                  )}
                  <button
                    onClick={() => clearSelectedProduct()}
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
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{t('menuUi.priceLabel')}</span>
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
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">{t('menuUi.variantsLabel')}</h4>
                      <div className="space-y-2 rounded-3xl border border-gray-100 bg-gray-50 p-3">
                        {selectedProduct.variants.map((variant) => (
                          <div key={variant.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{variant.name}</p>
                              {variant.isDefault && (
                                <p className=" font-bold text-[11px] text-gray-500 mt-1">{t('menuUi.defaultVariant')}</p>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(variant.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-4 mb-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400">{t('menuUi.descriptionLabel')}</h4>
                    <p className={`${typography.modalDescription} text-gray-600 leading-relaxed`}>{getProductDetailDescription(selectedProduct)}</p>
                  </div>
                  <button
                    onClick={() => clearSelectedProduct()}
                    className={`w-full mt-10 py-4 rounded-2xl text-white font-bold ${typography.closeButton} shadow-lg`}
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 10px 20px -5px ${primaryColor}40`,
                    }}
                  >
                    {t('menuUi.close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 mt-12 text-center">
        <div className="h-px bg-gray-200 w-24 mx-auto mb-6" />
        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('menuUi.poweredBy')}</p>
      </div>
    </div>
  );
}
