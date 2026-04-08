import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Leaf, MapPin, Phone, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMenuContext } from '../../MenuProvider';
import PrivatePreviewInlineNotice from '../../PrivatePreviewInlineNotice';
import { useTranslation } from '../../../../i18n';

type CardMode = 'atelier' | 'compact';

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

export default function TemplateBotanicalSketch() {
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

  const [cardMode, setCardMode] = useState<CardMode>('atelier');

  const detailContent = useMemo(() => {
    if (!selectedProduct) return null;

    const primary = selectedProduct.shortDescription?.trim() || selectedProduct.description?.trim() || '';
    const detailed = getProductDetailDescription(selectedProduct).trim();
    const hasSeparateDetail = primary.length > 0 && detailed.length > 0 && primary !== detailed;

    return {
      primary: primary || detailed,
      detailed,
      hasSeparateDetail,
    };
  }, [selectedProduct, getProductDetailDescription]);

  const cardsClassName = cardMode === 'atelier' ? 'grid gap-4 lg:grid-cols-2' : 'space-y-3';

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[#807c6d]" style={{ backgroundColor: bgColor }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,249,231,0.16)_0%,transparent_28%),radial-gradient(circle_at_82%_96%,rgba(30,25,19,0.2)_0%,transparent_34%)]" />

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[36px] border border-[#d4ccb4] bg-[#efe8d2] p-4 shadow-[0_16px_34px_-20px_rgba(39,35,28,0.45)] sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-start">
            <div className="overflow-hidden rounded-[24px] border border-[#b8af98] bg-[#ded6bd]">
              {store?.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt="Logo"
                  className="h-28 w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-28 w-full items-center justify-center text-4xl font-semibold text-[#9b947f]">
                  {(store?.name || 'L').charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f8a79]">La Petite Collection</p>
              <h1 className="mt-2 line-clamp-2 text-4xl font-semibold italic leading-[0.95] text-[#7d7869] sm:text-5xl">
                {store?.name || 'Coffee Shop'}
              </h1>

              {(store?.address || store?.phone) && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#868170]">
                  {store?.address ? (
                    <p className="inline-flex items-center gap-1 rounded-full border border-[#cec5ad] bg-[#f2ebd8] px-3 py-1.5">
                      <MapPin size={13} />
                      {store.address}
                    </p>
                  ) : null}
                  {store?.phone ? (
                    <p className="inline-flex items-center gap-1 rounded-full border border-[#cec5ad] bg-[#f2ebd8] px-3 py-1.5">
                      <Phone size={13} />
                      {store.phone}
                    </p>
                  ) : null}
                </div>
              )}

              {store?.bio ? <p className="mt-3 text-sm font-medium text-[#7f7a69]">{store.bio}</p> : null}
              <PrivatePreviewInlineNotice className="border-[#c9bea6] bg-[#f2ead8] text-[#7d7768]" />
            </div>
          </div>

        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="mt-5 rounded-[34px] border border-[#d4ccb4] bg-[#f1ead8] p-4 shadow-[0_16px_34px_-20px_rgba(39,35,28,0.42)] sm:p-6"
        >
          <div className="mb-4 rounded-full border border-[#cdc4ad] bg-[#e8dfc8] px-4 py-2">
            <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#857f6f]">
              <Leaf size={12} />
              {t('menuUi.categoriesLabel')}
            </p>
          </div>

          <h2 className="text-4xl font-semibold leading-[1.02] text-[#7b7667] sm:text-5xl">{t('menuUi.chooseProductPrompt')}</h2>


          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active
                    ? 'border-[#8f8a79] bg-[#8f8a79] text-[#f7f0de]'
                    : 'border-[#cac2ab] bg-[#f6efdd] text-[#7d7768] hover:bg-[#ece3ca]'
                    }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="mt-5"
        >
          {filteredProducts.length > 0 ? (
            <div className={cardsClassName}>
              {filteredProducts.map((product, idx) => {
                const compact = cardMode === 'compact';

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`group rounded-[30px] border border-[#d4ccb4] bg-[#f4ecd9] p-3 shadow-[0_14px_30px_-22px_rgba(43,35,24,0.65)] ${compact ? 'flex gap-3' : ''}`}
                  >
                    {product.imageUrl ? (
                      <div className={`${compact ? 'h-28 w-28 flex-shrink-0 rounded-[20px]' : 'h-52 w-full rounded-[24px]'} overflow-hidden border border-[#c4baa2] bg-[#ddd5bc]`}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className={`${compact ? 'h-28 w-28 flex-shrink-0 rounded-[20px]' : 'h-52 w-full rounded-[24px]'} border border-[#c4baa2] bg-[radial-gradient(circle_at_top_left,_#f6f0df_0%,_#d9cfb5_58%,_#9f9886_100%)]`} />
                    )}

                    <div className={`${compact ? 'min-w-0 flex-1' : 'px-1 pt-3'} space-y-2`}>
                      <h3 className="line-clamp-1 text-3xl font-semibold italic text-[#777263]">{product.name}</h3>

                      {product.shortDescription || product.description ? (
                        <p className="line-clamp-2 text-sm font-medium text-[#888372]">
                          {product.shortDescription?.trim() || product.description?.trim()}
                        </p>
                      ) : null}

                      {product.hashtags && product.hashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {product.hashtags.slice(0, 4).map((tag) => (
                            <span
                              key={`${product.id}-${tag}`}
                              className="rounded-full border border-[#cec5ad] bg-[#eee6d0] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8f8a79]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-end justify-between gap-2 pt-1">
                        <p className="text-xl font-semibold text-[#857f70]">{getProductDisplayPrice(product)}</p>
                        <button
                          type="button"
                          onClick={() => selectProduct(product)}
                          className="inline-flex items-center gap-1 rounded-full border border-[#908a79] bg-[#908a79] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f0de] transition hover:bg-[#7f796a]"
                        >
                          {t('menuUi.viewDetails')}
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#c2b8a1] bg-[#f2e9d5] p-10 text-center">
              <p className="text-xl font-semibold text-[#7e7969]">{t('menuUi.noProductsTitle')}</p>
              <p className="mt-2 text-sm font-medium text-[#908a79]">{t('menuUi.noProductsDescription')}</p>
            </div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {selectedProduct && detailContent ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={clearSelectedProduct}
              className="fixed inset-0 z-50 bg-[#575243]/58 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
            >
              <div className="relative w-full max-w-4xl overflow-hidden rounded-[30px] border border-[#cbc2aa] bg-[#f1e8d4] shadow-[0_24px_40px_-28px_rgba(24,22,18,0.65)]">
                <button
                  type="button"
                  onClick={clearSelectedProduct}
                  className="absolute top-4 right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cbc2aa] bg-white text-[#857f70] shadow-lg"
                >
                  <X size={18} />
                </button>
                <div className="grid max-h-[90vh] overflow-hidden lg:grid-cols-[1fr_1fr]">
                  <div className="relative h-64 border-b border-[#c8bea6] bg-[#ddd4bc] lg:h-auto lg:border-b-0 lg:border-r">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_#f6f0df_0%,_#d9cfb5_58%,_#9f9886_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#5a5446]/62 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f4ecda]">{t('menuUi.productDetailTitle')}</p>
                      <h4 className="mt-1 text-4xl font-semibold italic text-[#f8f1e0]">{selectedProduct.name}</h4>
                      <p className="mt-2 text-xl font-semibold text-[#efe8d6]">{getProductDisplayPrice(selectedProduct)}</p>
                    </div>
                  </div>

                  <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5 sm:max-h-[90vh] sm:p-6">

                    {selectedProduct.hashtags && selectedProduct.hashtags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.hashtags.map((tag) => (
                          <span
                            key={`detail-${selectedProduct.id}-${tag}`}
                            className="rounded-full border border-[#cec5ad] bg-[#eee6d0] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8f8a79]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {detailContent.primary ? (
                      <div className="rounded-[20px] border border-[#cbc2ab] bg-[#faf4e4] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8778]">{t('menuUi.descriptionLabel')}</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-[#7e7969]">{detailContent.primary}</p>
                      </div>
                    ) : null}

                    {detailContent.hasSeparateDetail ? (
                      <div className="rounded-[20px] border border-[#cbc2ab] bg-[#f3ecd9] p-4">
                        <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d8778]">
                          <Sparkles size={12} />
                          {t('menuUi.detailedDescriptionLabel')}
                        </p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-[#7e7969]">{detailContent.detailed}</p>
                      </div>
                    ) : null}

                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      <div className="rounded-[20px] border border-[#cbc2ab] bg-[#faf4e4] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8778]">{t('menuUi.variantPricesLabel')}</p>
                        <div className="mt-3 space-y-2.5">
                          {selectedProduct.variants.map((variant, idx) => {
                            const variantPrice = parseNumber(variant.price);
                            const basePrice = parseNumber(selectedProduct.price);
                            const delta = variantPrice - basePrice;

                            return (
                              <div
                                key={`${variant.id || variant.name}-${idx}`}
                                className="flex items-center justify-between rounded-2xl border border-[#d7ceb7] bg-[#f6efdf] px-3 py-2.5"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-[#7a7566]">{variant.name}</p>
                                  {variant.isDefault ? <p className="font-bold text-[11px] font-medium text-[#8e8879]">{t('menuUi.defaultVariant')}</p> : null}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-[#7f796a]">{formatCurrency(variantPrice)}</p>
                                  {delta > 0 ? <p className="text-[11px] font-medium text-[#8e8879]">+{formatCurrency(delta)}</p> : null}
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
                      className="w-full rounded-full border border-[#8f8a79] bg-[#8f8a79] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#f7f0de] transition hover:bg-[#7e796a]"
                    >
                      {t('menuUi.close')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}