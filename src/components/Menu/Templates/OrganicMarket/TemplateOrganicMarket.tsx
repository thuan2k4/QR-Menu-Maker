import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Leaf, MapPin, Phone, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMenuContext } from '../../MenuProvider';
import PrivatePreviewInlineNotice from '../../PrivatePreviewInlineNotice';
import { useTranslation } from '../../../../i18n';

function parseNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export default function TemplateOrganicMarket() {
  const { t } = useTranslation();
  const {
    filteredProducts,
    categories,
    activeCategory,
    setActiveCategory,
    selectedProduct,
    clearSelectedProduct,
    selectProduct,
    store,
    bgColor,
    getProductDisplayPrice,
    getProductDetailDescription,
    formatCurrency,
  } = useMenuContext();

  const [cardView, setCardView] = useState<'showcase' | 'compact'>('showcase');

  const detailContent = useMemo(() => {
    if (!selectedProduct) return null;

    const primary = selectedProduct.description?.trim() || '';
    const detailed = getProductDetailDescription(selectedProduct).trim();
    const resolvedPrimary = primary || detailed;
    const hasSeparateDetail = primary.length > 0 && detailed.length > 0 && primary !== detailed;

    return {
      primary: resolvedPrimary,
      detailed,
      hasSeparateDetail,
    };
  }, [selectedProduct, getProductDetailDescription]);

  const cardsClassName = cardView === 'showcase' ? 'grid gap-4 lg:grid-cols-2' : 'space-y-3';

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[#1f2a14]" style={{ backgroundColor: bgColor }}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(120,138,60,0.12)_0%,rgba(237,241,223,0)_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(circle_at_0%_0%,rgba(92,111,41,0.38)_0%,rgba(237,241,223,0)_72%)]" />

      <div className="relative h-56 overflow-hidden border-b border-[#d3dcba] sm:h-64">
        {store?.coverUrl ? (
          <img
            src={store.coverUrl}
            alt="Cover"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_#a4b95a_0%,_#6e8332_58%,_#4f6125_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a3614]/36 via-[#283515]/48 to-[#1c250f]/72" />
        <div className="absolute inset-x-0 top-4 flex justify-center px-4">
          <p className="inline-flex items-center gap-2 border border-[#d8e0bc]/65 bg-[#f8faea]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#e8efcc] backdrop-blur-sm">
            <Leaf size={12} />
            Organic Menu Concept
          </p>
        </div>
      </div>

      <div className="relative mx-auto -mt-12 max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
          className="border border-[#c4cf9f] bg-[#f8faee] p-4 shadow-[0_22px_40px_-26px_rgba(43,55,21,0.7)] sm:p-5"
        >
          <div className="grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-start">
            <div className="h-20 w-20 border-2 border-[#90a353] bg-[#d6dfae] p-1">
              {store?.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt="Logo"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#edf2d8] text-2xl font-black text-[#5f712e]">
                  {(store?.name || 'M').charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#7b8f3f]">Organic Daily Picks</p>
              <h1 className="text-3xl font-black leading-tight text-[#233015] sm:text-4xl">{store?.name || 'Coffee Shop'}</h1>
              {store?.bio ? <p className="text-sm font-semibold text-[#607036]">{store.bio}</p> : null}

              {(store?.address || store?.phone) && (
                <div className="flex flex-wrap gap-3 pt-1 text-sm font-bold text-[#4e5f28]">
                  {store?.address ? (
                    <span className="inline-flex items-center gap-1.5 border border-[#d4ddba] bg-white px-2.5 py-1">
                      <MapPin size={14} className="text-[#6f8234]" />
                      {store.address}
                    </span>
                  ) : null}
                  {store?.phone ? (
                    <span className="inline-flex items-center gap-1.5 border border-[#d4ddba] bg-white px-2.5 py-1">
                      <Phone size={14} className="text-[#6f8234]" />
                      {store.phone}
                    </span>
                  ) : null}
                </div>
              )}

              <PrivatePreviewInlineNotice className="border-[#c7d39b] bg-[#f7fbe7] text-[#4e5f26]" />
            </div>

            <div className="inline-flex h-fit items-center gap-2 border border-[#d4ddba] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#5f712e]">
              <span className="h-2 w-2 bg-[#7d9440]" />
              {t('menuUi.freshToday')}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.42 }}
          className="mt-6 border border-[#c4cf9f] bg-white p-4 shadow-[0_22px_40px_-28px_rgba(43,55,21,0.64)] sm:p-5"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#738739]">{t('menuUi.categoriesLabel')}</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-[#1f2b14] sm:text-[2rem]">{t('menuUi.chooseProductPrompt')}</h2>
            </div>

          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  whileTap={{ scale: 0.97 }}
                  className={`px-4 py-2 text-sm font-black transition ${active
                    ? 'border-2 border-[#6a7f34] bg-[#6a7f34] text-white'
                    : 'border border-[#ccd6a9] bg-[#f9fbed] text-[#53622d] hover:border-[#9dae6a]'
                    }`}
                >
                  {cat.name}
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.42 }}
          className="mt-6"
        >
          {filteredProducts.length > 0 ? (
            <div className={cardsClassName}>
              {filteredProducts.map((product, idx) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`group border border-[#cfd8ae] bg-[#fcfdf7] shadow-[0_14px_30px_-24px_rgba(43,55,21,0.78)] ${cardView === 'compact' ? 'flex gap-3 p-3' : 'overflow-hidden'
                    }`}
                >
                  {product.imageUrl ? (
                    <div className={`${cardView === 'compact' ? 'h-24 w-24 flex-shrink-0' : 'h-56 w-full'} overflow-hidden border-b border-[#d4ddb8] bg-[#e7edca]`}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain object-center transition duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className={`${cardView === 'compact' ? 'h-24 w-24 flex-shrink-0' : 'h-56 w-full'} border-b border-[#d4ddb8] bg-[radial-gradient(circle_at_top_left,_#dce6a5_0%,_#aabc66_62%,_#7f9444_100%)]`} />
                  )}

                  <div className={`${cardView === 'compact' ? 'min-w-0 flex-1' : 'p-4'} space-y-2`}>

                    <h3 className="line-clamp-1 text-2xl font-black text-[#1f2b14]">{product.name}</h3>
                    {product.shortDescription || product.description ? (
                      <p className="line-clamp-2 text-sm font-semibold text-[#5a6a32]">
                        {product.shortDescription?.trim() || product.description?.trim()}
                      </p>
                    ) : null}

                    {product.hashtags && product.hashtags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {product.hashtags.slice(0, 4).map((tag) => (
                          <span
                            key={`${product.id}-${tag}`}
                            className="border border-[#d6dfba] bg-[#f2f6e2] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#6a7d35]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-end justify-between gap-2 pt-1">
                      <p className="text-md font-black text-[#6a7f34]">{getProductDisplayPrice(product)}</p>
                      <button
                        type="button"
                        onClick={() => selectProduct(product)}
                        className="inline-flex items-center gap-1.5 border-b-2 border-[#6a7f34] pb-1 text-xs font-black uppercase tracking-[0.12em] text-[#4e5f26] transition hover:text-[#233015]"
                      >
                        {t('menuUi.viewDetails')}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#c5ce9c] bg-[#f7faeb] p-10 text-center">
              <p className="text-lg font-black text-[#5e6f31]">{t('menuUi.noProductsTitle')}</p>
              <p className="mt-2 text-sm font-semibold text-[#778741]">{t('menuUi.noProductsDescription')}</p>
            </div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {selectedProduct && detailContent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={clearSelectedProduct}
              className="fixed inset-0 z-50 bg-[#1f260f]/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 26 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
            >
              <div className="w-full max-w-4xl overflow-hidden border border-[#c8d2a3] bg-[#f9faee] shadow-[0_30px_90px_-30px_rgba(31,38,15,0.9)]">
                <div className="grid max-h-[88vh] overflow-hidden md:grid-cols-[1.05fr_1fr]">
                  <div className="relative h-64 border-b border-[#d4ddba] bg-[#dce4a3] md:h-auto md:border-b-0 md:border-r">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="h-full w-full object-contain object-center"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_#dde5a8_0%,_#afc26a_60%,_#7f9444_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f260f]/66 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#deeaac]">{t('menuUi.productDetailTitle')}</p>
                      <h3 className="mt-1 text-2xl font-black text-white">{selectedProduct.name}</h3>
                      <p className="mt-2 text-2xl font-black text-[#edf7c1]">{getProductDisplayPrice(selectedProduct)}</p>
                    </div>
                  </div>

                  <div className="max-h-[58vh] space-y-4 overflow-y-auto p-5 sm:max-h-[88vh] sm:p-6">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={clearSelectedProduct}
                        className="inline-flex h-9 w-9 items-center justify-center border border-[#c8d2a3] bg-white text-[#41511f]"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    {selectedProduct.hashtags && selectedProduct.hashtags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.hashtags.map((tag) => (
                          <span
                            key={`detail-${selectedProduct.id}-${tag}`}
                            className="border border-[#d6dfba] bg-[#f2f6e2] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#6a7d35]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {detailContent.primary ? (
                      <div className="border border-[#d5ddb8] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6f8234]">{t('menuUi.descriptionLabel')}</p>
                        <p className="mt-2 text-sm font-semibold leading-relaxed text-[#4f6028]">{detailContent.primary}</p>
                      </div>
                    ) : null}

                    {detailContent.hasSeparateDetail ? (
                      <div className="border border-[#d5ddb8] bg-[#f2f6de] p-4">
                        <p className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#6f8234]">
                          <Sparkles size={12} />
                          {t('menuUi.detailedDescriptionLabel')}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-relaxed text-[#4f6028]">{detailContent.detailed}</p>
                      </div>
                    ) : null}

                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      <div className="border border-[#d5ddb8] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6f8234]">{t('menuUi.variantPricesLabel')}</p>
                        <div className="mt-3 space-y-2">
                          {selectedProduct.variants.map((variant, idx) => {
                            const variantPrice = parseNumber(variant.price);
                            const basePrice = parseNumber(selectedProduct.price);
                            const delta = variantPrice - basePrice;

                            return (
                              <div
                                key={`${variant.id || variant.name}-${idx}`}
                                className="flex items-center justify-between border border-[#dce4bf] bg-[#fbfdf2] px-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-black text-[#293515]">{variant.name}</p>
                                  {variant.isDefault ? <p className="font-bold text-[11px] font-semibold text-[#7a8a3c]">{t('menuUi.defaultVariant')}</p> : null}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-[#6a7f34]">{formatCurrency(variantPrice)}</p>
                                  {delta > 0 ? <p className="text-[11px] font-semibold text-[#7a8a3c]">+{formatCurrency(delta)}</p> : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={clearSelectedProduct}
                      className="flex w-full items-center justify-center gap-2 border border-[#6a7f34] bg-[#6a7f34] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#55662a]"
                    >
                      <Leaf size={14} />
                      {t('menuUi.close')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}