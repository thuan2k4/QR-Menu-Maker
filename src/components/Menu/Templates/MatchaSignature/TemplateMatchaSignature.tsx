import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, MapPin, Phone, Sparkles, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMenuContext } from '../../MenuProvider';

type ProductViewMode = 'showcase' | 'compact';

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

export default function TemplateMatchaSignature() {
  const {
    filteredProducts,
    categories,
    activeCategory,
    setActiveCategory,
    selectedProduct,
    clearSelectedProduct,
    selectProduct,
    store,
    getProductDisplayPrice,
    getProductDetailDescription,
    formatCurrency,
  } = useMenuContext();

  const [productViewMode, setProductViewMode] = useState<ProductViewMode>('showcase');

  const detailContent = useMemo(() => {
    if (!selectedProduct) return null;

    const summary = selectedProduct.shortDescription?.trim() || selectedProduct.description?.trim() || '';
    const fullDescription = getProductDetailDescription(selectedProduct).trim();
    const hasSeparateDetail = fullDescription.length > 0 && fullDescription !== summary;

    return {
      summary,
      fullDescription,
      hasSeparateDetail,
    };
  }, [selectedProduct, getProductDetailDescription]);

  const activeCategoryName = useMemo(
    () => categories.find((category) => category.id === activeCategory)?.name || 'Menu',
    [categories, activeCategory],
  );

  const cardsClassName = productViewMode === 'showcase' ? 'grid gap-5 lg:grid-cols-2' : 'space-y-3';

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8f3e9] text-[#2c2017]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(161,95,56,0.14)_0%,rgba(248,243,233,0)_44%),radial-gradient(circle_at_84%_84%,rgba(124,90,64,0.13)_0%,rgba(248,243,233,0)_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(120,89,66,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,89,66,0.07)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="relative h-[240px] overflow-hidden rounded-b-[34px] border-b border-[#d8c7b0] sm:h-[280px]">
        {store?.coverUrl ? (
          <img
            src={store.coverUrl}
            alt="Cover"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_#7f5a40_0%,_#573a28_56%,_#2f1f16_100%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-[#2e1f15]/34 via-[#2e1f15]/52 to-[#2e1f15]/66" />

        <div className="absolute inset-x-0 top-4 mx-auto flex w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <p className="inline-flex rounded-full border border-[#f4d8c0]/75 bg-[#fff3e7]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#fff4ea] backdrop-blur-sm">
            Signature Market
          </p>
          <p className="inline-flex rounded-full border border-[#f4d8c0]/75 bg-[#fff3e7]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#fff4ea] backdrop-blur-sm">
            Seasonal Edit
          </p>
        </div>
      </div>

      <div className="relative mx-auto -mt-10 w-full max-w-5xl px-4 sm:-mt-12 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="rounded-[30px] border border-[#d8c7b0] bg-[#fffaf3]/95 p-4 shadow-[0_18px_36px_-24px_rgba(78,49,29,0.45)] backdrop-blur-sm sm:p-5"
        >
          <div className="grid gap-4 md:grid-cols-[84px_minmax(0,1fr)_auto] md:items-start">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#e6d8c6] bg-[#ece2d4] shadow-[0_7px_14px_-10px_rgba(72,46,28,0.45)] sm:h-20 sm:w-20">
              {store?.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt="Logo"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-black text-[#7a4a2e]">
                  {(store?.name || 'S').charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a66139]">Fresh Batch Daily</p>
              <h1 className="line-clamp-2 text-3xl font-black leading-tight text-[#2d2016] sm:text-4xl">{store?.name || 'Coffee Shop'}</h1>

              {(store?.address || store?.phone) ? (
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#5d4a3b]">
                  {store?.address ? (
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ebdc] px-3 py-1.5">
                      <MapPin size={13} className="text-[#a66139]" />
                      {store.address}
                    </p>
                  ) : null}
                  {store?.phone ? (
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ebdc] px-3 py-1.5">
                      <Phone size={13} className="text-[#a66139]" />
                      {store.phone}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {store?.bio ? <p className="text-sm font-medium text-[#655142]">{store.bio}</p> : null}
            </div>

            <div className="inline-flex h-fit items-center gap-1.5 rounded-full bg-[#f1e5d3] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#7b4729]">
              <Star size={12} className="text-[#c17349]" />
              {activeCategoryName}
            </div>
          </div>
        </motion.section>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.36 }}
          className="rounded-[30px] border border-[#d8c7b0] bg-[#fff8ee] p-5 shadow-[0_14px_34px_-24px_rgba(78,49,29,0.32)]"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a66139]">Danh Mục</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-[#2d2016] sm:text-[2rem]">Chọn sản phẩm bạn muốn thử</h2>
            </div>

            <div className="inline-flex justify-self-start rounded-full border border-[#d8c7b0] bg-[#f4ecde] p-1">
              {[
                { id: 'showcase', label: 'Thẻ lớn' },
                { id: 'compact', label: 'Thẻ gọn' },
              ].map((view) => {
                const active = productViewMode === view.id;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setProductViewMode(view.id as ProductViewMode)}
                    aria-pressed={active}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.08em] transition ${active
                      ? 'bg-[#9e5e38] text-[#fffaf5] shadow-[0_8px_16px_-12px_rgba(96,56,32,0.9)]'
                      : 'text-[#6a503f] hover:bg-[#ebdfcd]'
                      }`}
                  >
                    {view.label}
                  </button>
                );
              })}
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
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition ${active
                    ? 'border-[#a15f38] bg-[#a15f38] text-white'
                    : 'border-[#d6c4ac] bg-[#fffdf9] text-[#5d4838] hover:bg-[#efe3d1]'
                    }`}
                >
                  {cat.name}
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.36 }}
          className="mt-6"
        >
          {filteredProducts.length > 0 ? (
            <div className={cardsClassName}>
              {filteredProducts.map((product, idx) => {
                const compact = productViewMode === 'compact';

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`group rounded-[26px] border border-[#d8c7b3] bg-[#fffbf4] p-3 shadow-[0_14px_30px_-24px_rgba(74,48,30,0.32)] ${compact ? 'flex items-start gap-3' : 'space-y-3'
                      }`}
                  >
                    {product.imageUrl ? (
                      <div className={`${compact ? 'h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#ded4c3]' : 'relative h-56 overflow-hidden rounded-[20px] bg-[#ded4c3]'}`}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {!compact ? (
                          <span className="absolute left-3 top-3 rounded-full bg-[#fff4e5] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#8d5332]">
                            Editor's Pick
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className={`${compact ? 'h-24 w-24 flex-shrink-0 rounded-2xl' : 'h-56 rounded-[20px]'} bg-[radial-gradient(circle_at_top_left,_#d8bd9f_0%,_#b1825c_56%,_#7f5339_100%)]`} />
                    )}

                    <div className={`${compact ? 'min-w-0 flex-1 space-y-2' : 'space-y-2 px-1 pb-1'}`}>
                      <h3 className={`line-clamp-1 font-black text-[#2d2016] ${compact ? 'text-xl' : 'text-[2rem]'}`}>{product.name}</h3>
                      {product.shortDescription || product.description ? (
                        <p className="line-clamp-2 text-sm font-medium leading-relaxed text-[#615040]">
                          {product.shortDescription?.trim() || product.description?.trim()}
                        </p>
                      ) : null}

                      {product.hashtags && product.hashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {product.hashtags.slice(0, 4).map((tag) => (
                            <span
                              key={`${product.id}-${tag}`}
                              className="rounded-full bg-[#f4ebdc] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#825337]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-end justify-between gap-2 pt-1">
                        <p className="text-2xl font-black text-[#9a5936]">{getProductDisplayPrice(product)}</p>
                        <button
                          type="button"
                          onClick={() => selectProduct(product)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#a15f38] bg-[#a15f38] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#8f5130]"
                        >
                          Xem chi tiết
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#cab79f] bg-[#fff8ee] p-10 text-center">
              <p className="text-lg font-black text-[#2d2016]">Danh mục này chưa có sản phẩm</p>
              <p className="mt-2 text-sm font-semibold text-[#6b5849]">Hãy chọn danh mục khác để xem thêm món mới.</p>
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
              className="fixed inset-0 z-50 bg-[#2c1e15]/58 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
            >
              <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#d8c7b3] bg-[#fffbf5] shadow-[0_36px_80px_-32px_rgba(66,42,27,0.6)]">
                <div className="grid max-h-[90vh] overflow-hidden lg:grid-cols-[1.04fr_1fr]">
                  <div className="relative h-64 border-b border-[#d8c7b3] bg-[#d8ccba] lg:h-auto lg:border-b-0 lg:border-r">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_#d8bd9f_0%,_#b1825c_56%,_#7f5339_100%)]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#2b1e16]/74 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ffd7b9]">Chi tiết sản phẩm</p>
                      <h4 className="mt-1 text-3xl font-black text-white">{selectedProduct.name}</h4>
                      <p className="mt-2 text-2xl font-black text-[#ffe6d4]">{getProductDisplayPrice(selectedProduct)}</p>
                    </div>
                  </div>

                  <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5 sm:max-h-[90vh] sm:p-6">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={clearSelectedProduct}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7c5ad] bg-[#fff7eb] text-[#815439]"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {selectedProduct.hashtags && selectedProduct.hashtags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.hashtags.map((tag) => (
                          <span
                            key={`detail-${selectedProduct.id}-${tag}`}
                            className="rounded-full bg-[#f4ebdc] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#815439]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {detailContent.summary ? (
                      <div className="rounded-2xl border border-[#dcccb7] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a66139]">Mô tả</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-[#5f4b3d]">{detailContent.summary}</p>
                      </div>
                    ) : null}

                    {detailContent.hasSeparateDetail ? (
                      <div className="rounded-2xl border border-[#e3d2bc] bg-[#fff7ec] p-4">
                        <p className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#a66139]">
                          <Sparkles size={12} />
                          Mô tả chi tiết
                        </p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-[#5f4b3d]">{detailContent.fullDescription}</p>
                      </div>
                    ) : null}

                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      <div className="rounded-2xl border border-[#dcccb7] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a66139]">Giá variants</p>
                        <div className="mt-3 space-y-2.5">
                          {selectedProduct.variants.map((variant, idx) => {
                            const variantPrice = parseNumber(variant.price);
                            const basePrice = parseNumber(selectedProduct.price);
                            const delta = variantPrice - basePrice;

                            return (
                              <div
                                key={`${variant.id || variant.name}-${idx}`}
                                className="flex items-center justify-between rounded-xl border border-[#e2d3bf] bg-[#fff9f0] px-3 py-2.5"
                              >
                                <div>
                                  <p className="text-sm font-black text-[#2d2016]">{variant.name}</p>
                                  {variant.isDefault ? <p className="text-[11px] font-medium text-[#725b4a]">Mặc định</p> : null}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-[#8e5534]">{formatCurrency(variantPrice)}</p>
                                  {delta > 0 ? <p className="text-[11px] font-medium text-[#725b4a]">+{formatCurrency(delta)}</p> : null}
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
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-[#a15f38] bg-[#a15f38] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#8f5130]"
                    >
                      Đóng
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