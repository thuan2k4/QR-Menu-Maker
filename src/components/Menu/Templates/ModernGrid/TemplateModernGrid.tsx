import { AnimatePresence, motion } from 'motion/react';
import { X, Smartphone } from 'lucide-react';
import { useMenuContext } from '../../MenuProvider';
import CategoryGridBold from './CategoryGridBold';
import ProductGridCard from './ProductGridCard';
import PrivatePreviewInlineNotice from '../../PrivatePreviewInlineNotice';
import { useTranslation } from '../../../../i18n';

export default function TemplateModernGrid() {
  const { t } = useTranslation();
  const {
    filteredProducts,
    store,
    primaryColor,
    bgColor,
    selectedProduct,
    clearSelectedProduct,
    getProductDisplayPrice,
    getProductDetailDescription,
    formatCurrency,
    typography,
  } = useMenuContext();

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: bgColor }}>
      <div className="relative overflow-hidden">
        {store?.coverUrl ? (
          <div className="relative h-56 overflow-hidden">
            <img src={store.coverUrl} alt="Cover" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        ) : (
          <div className="h-56 bg-emerald-900" />
        )}

        <div className="relative mx-auto max-w-5xl px-6 -mt-16 space-y-8">
          {/* Enhanced Store Header - BOLD STYLING */}
          <div className="rounded-[32px] bg-gradient-to-br from-white via-white to-emerald-50/30 p-8 shadow-lg border border-emerald-100/50 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-20" /></div>
            <div className="relative grid gap-8 md:grid-cols-[120px_minmax(0,1fr)] items-center">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-200 to-emerald-100 blur-xl opacity-70" />
                <div className="relative h-28 w-28 rounded-3xl overflow-hidden border-3 border-emerald-300 bg-white shadow-xl ring-4 ring-emerald-100/50">
                  {store?.logoUrl ? (
                    <img src={store.logoUrl} alt="Logo" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-black text-emerald-600">{store?.name?.charAt(0) || 'M'}</div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.15em] text-emerald-600 font-bold">✨ {t('menuUi.welcomeTo')}</p>
                  <h1 className="text-4xl font-black text-gray-900 leading-tight">{store?.name || 'Coffee Shop'}</h1>
                </div>
                <div className="flex flex-wrap gap-5 text-sm text-gray-700 font-semibold">
                  {store?.address && <span className="flex items-center gap-2"><span className="text-lg">📍</span>{store.address}</span>}
                  {store?.phone && <span className="flex items-center gap-2"><span className="text-lg">☎️</span>{store.phone}</span>}
                </div>
                {store?.bio && <p className="text-sm text-gray-600 max-w-2xl leading-relaxed font-medium">{store.bio}</p>}
                <PrivatePreviewInlineNotice className="border-emerald-200 bg-emerald-50 text-emerald-800" />
              </div>
            </div>
          </div>

          {/* BOLD Category Section */}
          <div className="rounded-[28px] bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 shadow-xl text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-10"><div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-2xl" /></div>
            <div className="relative space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] font-bold text-emerald-100">📋 {t('menuUi.menuCategories')}</p>
                <h2 className="text-2xl font-black text-white mt-2">{t('menuUi.cravingPrompt')}</h2>
              </div>
              <CategoryGridBold />
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductGridCard key={product.id} product={product} />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                {t('menuUi.noProductsTitle')}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={clearSelectedProduct}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:px-6 sm:pb-6"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 24, stiffness: 200 }}
                className="w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-2xl flex flex-col"
                style={{ maxHeight: 'calc(100vh - 3rem)' }}
              >
                <div className="relative overflow-hidden rounded-t-[32px]">
                  {selectedProduct.imageUrl ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="h-64 w-full object-contain object-center"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-64 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <Smartphone size={48} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={clearSelectedProduct}
                    className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md backdrop-blur"
                  >
                    <X size={22} />
                  </button>
                </div>
                <div className="px-6 py-6 sm:px-8 sm:pb-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{t('menuUi.productDetailTitle')}</p>
                      <h2 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h2>
                      {selectedProduct.shortDescription ? (
                        <p className="text-sm leading-relaxed text-gray-600 max-w-2xl">{selectedProduct.shortDescription}</p>
                      ) : null}
                    </div>

                    <div className="rounded-[28px] border border-gray-200 bg-emerald-50 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-700">{t('menuUi.priceLabel')}</p>
                      <p className={`mt-3 ${typography.modalPrice} font-bold`} style={{ color: primaryColor }}>
                        {getProductDisplayPrice(selectedProduct)}
                      </p>
                    </div>

                    {selectedProduct.hashtags && selectedProduct.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.hashtags.map((tag) => (
                          <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{tag}</span>
                        ))}
                      </div>
                    )}

                    {(selectedProduct.longDescription || selectedProduct.description) && (
                      <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{t('menuUi.descriptionLabel')}</p>
                        <p className="mt-3 text-sm leading-relaxed text-gray-700">
                          {selectedProduct.longDescription || selectedProduct.description}
                        </p>
                      </div>
                    )}

                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                      <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{t('menuUi.optionsLabel')}</p>
                        <div className="mt-3 grid gap-3">
                          {selectedProduct.variants.map((variant) => (
                            <div key={variant.id} className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-sm">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">{variant.name}</p>
                                {variant.isDefault && <p className="font-bold text-[11px] text-gray-500">{t('menuUi.defaultVariant')}</p>}
                              </div>
                              <span className="text-sm font-bold text-gray-900">{formatCurrency(variant.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={clearSelectedProduct}
                      className="rounded-3xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-lg hover:bg-emerald-700"
                    >
                      {t('menuUi.close')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
