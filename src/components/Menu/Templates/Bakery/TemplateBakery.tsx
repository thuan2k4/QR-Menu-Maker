import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, MapPin, Phone, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMenuContext } from '../../MenuProvider';

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

export default function TemplateBakery() {
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

  const [cardView, setCardView] = useState<'editorial' | 'compact'>('editorial');

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

  const cardWrapClass = cardView === 'editorial'
    ? 'grid gap-5 sm:grid-cols-2'
    : 'space-y-4';

  return (
    <div className="min-h-screen bg-[#f2eadf] text-[#2b1b16]">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_right,_#d0b089_0%,_#f2eadf_58%)] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-[34px] border border-[#e2d3c2] bg-[#f8f0e5] shadow-[0_16px_42px_-22px_rgba(91,49,25,0.55)]"
        >
          <div className="relative h-56 sm:h-72">
            {store?.coverUrl ? (
              <img
                src={store.coverUrl}
                alt="Cover"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#d89a63] via-[#b06d3c] to-[#7c4a2a]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2b1b16]/25 via-[#2b1b16]/40 to-[#2b1b16]/70" />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <div className="max-w-2xl rounded-[28px] border border-[#efddcb]/80 bg-[#fff7ef]/92 p-4 backdrop-blur-md sm:p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8d5b35]">Fresh Batch Daily</p>
                <h1 className="mt-2 text-3xl font-black leading-tight text-[#2b1b16] sm:text-4xl">
                  {store?.name || 'Bakery House'}
                </h1>
                {(store?.address || store?.phone || store?.bio) && (
                  <div className="mt-3 space-y-1.5 text-sm font-semibold text-[#5f4233]">
                    {store?.address && (
                      <p className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#9c5a30]" />
                        <span>{store.address}</span>
                      </p>
                    )}
                    {store?.phone && (
                      <p className="flex items-center gap-2">
                        <Phone size={14} className="text-[#9c5a30]" />
                        <span>{store.phone}</span>
                      </p>
                    )}
                    {store?.bio && <p className="pt-1 text-[#6c4a39]">{store.bio}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="mt-7 rounded-[30px] border border-[#e2d3c2] bg-[#fff6ea] p-5 shadow-[0_16px_40px_-26px_rgba(91,49,25,0.55)]"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#9c5a30]">Danh Mục</p>
              <h2 className="mt-2 text-2xl font-black text-[#2d1c16]">Chọn món bạn muốn thử</h2>
            </div>

            <div className="inline-flex rounded-full border border-[#e7d6c4] bg-[#f8eee1] p-1">
              {[
                { id: 'editorial', label: 'Thẻ lớn' },
                { id: 'compact', label: 'Gọn' },
              ].map((view) => {
                const active = cardView === view.id;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setCardView(view.id as 'editorial' | 'compact')}
                    className={`rounded-full px-4 py-2 text-xs font-black tracking-[0.08em] transition ${active
                      ? 'bg-[#8f4f2d] text-white shadow-[0_10px_20px_-12px_rgba(66,35,20,0.8)]'
                      : 'text-[#8f5f43] hover:text-[#5f3a27]'
                      }`}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  whileTap={{ scale: 0.97 }}
                  className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-bold transition ${active
                    ? 'border-[#8f4f2d] bg-[#8f4f2d] text-white shadow-[0_14px_26px_-18px_rgba(66,35,20,0.85)]'
                    : 'border-[#dfcdb8] bg-white text-[#704730] hover:border-[#b78562]'
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
          transition={{ delay: 0.14, duration: 0.45 }}
          className="mt-6"
        >
          {filteredProducts.length > 0 ? (
            <div className={cardWrapClass}>
              {filteredProducts.map((product, idx) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`group overflow-hidden rounded-[30px] border border-[#e1d0bc] bg-[#fffaf4] shadow-[0_16px_36px_-26px_rgba(91,49,25,0.55)] ${cardView === 'compact' ? 'flex gap-4 p-4' : 'p-5'
                    }`}
                >
                  {product.imageUrl ? (
                    <div className={`overflow-hidden rounded-[22px] bg-[#ead8c6] ${cardView === 'compact' ? 'h-28 w-28 flex-shrink-0' : 'h-56 w-full'
                      }`}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className={`rounded-[22px] bg-gradient-to-br from-[#e7d3be] to-[#f4e7d7] ${cardView === 'compact' ? 'h-28 w-28 flex-shrink-0' : 'h-56 w-full'
                      }`} />
                  )}

                  <div className={`min-w-0 ${cardView === 'compact' ? 'flex-1' : 'mt-4'}`}>
                    <h3 className="text-xl font-black text-[#2f1f18] line-clamp-1">{product.name}</h3>
                    {product.description && (
                      <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-[#66493a]">{product.description}</p>
                    )}

                    {product.hashtags && product.hashtags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.hashtags.slice(0, 4).map((tag) => (
                          <span
                            key={`${product.id}-${tag}`}
                            className="rounded-full bg-[#f3e4d4] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#835134]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-2xl font-black text-[#8f4f2d]">{getProductDisplayPrice(product)}</p>
                      <button
                        type="button"
                        onClick={() => selectProduct(product)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d2b79f] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.09em] text-[#7d4b2f] transition hover:border-[#8f4f2d] hover:text-[#5f341d]"
                      >
                        Xem chi tiết
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#d8c2ad] bg-[#fff6eb] p-10 text-center">
              <p className="text-lg font-bold text-[#7d5339]">Danh mục này chưa có sản phẩm</p>
              <p className="mt-2 text-sm text-[#8e684f]">Hãy chọn danh mục khác để xem thêm món mới.</p>
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
              className="fixed inset-0 z-50 bg-[#1d110a]/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 36 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
            >
              <div className="w-full max-w-3xl overflow-hidden rounded-t-[30px] border border-[#e0c9b3] bg-[#fff8ef] shadow-[0_30px_90px_-30px_rgba(29,17,10,0.8)] sm:rounded-[34px]">
                <div className="relative h-56 overflow-hidden bg-[#efd9c4] sm:h-72">
                  {selectedProduct.imageUrl ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#dfc2a8] to-[#f0decf]" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#2b1b16]/68 to-transparent" />
                  <button
                    type="button"
                    onClick={clearSelectedProduct}
                    className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-[#2b1b16] shadow"
                  >
                    <X size={18} />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#f4d8bf]">Chi tiết sản phẩm</p>
                    <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">{selectedProduct.name}</h3>
                    <p className="mt-2 text-2xl font-black text-[#ffd3ad]">{getProductDisplayPrice(selectedProduct)}</p>
                  </div>
                </div>

                <div className="max-h-[58vh] space-y-5 overflow-y-auto p-5 sm:p-6">
                  {selectedProduct.hashtags && selectedProduct.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.hashtags.map((tag) => (
                        <span key={`detail-${selectedProduct.id}-${tag}`} className="rounded-full bg-[#f2e3d2] px-3 py-1 text-xs font-bold text-[#855438]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {detailContent.primary && (
                    <div className="rounded-[22px] border border-[#e2d0bd] bg-white p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5a39]">Mô tả</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#5f4435]">{detailContent.primary}</p>
                    </div>
                  )}

                  {detailContent.hasSeparateDetail && (
                    <div className="rounded-[22px] border border-[#e2d0bd] bg-[#fff3e6] p-4">
                      <p className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#8f5a39]">
                        <Sparkles size={12} />
                        Mô tả chi tiết
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[#5f4435]">{detailContent.detailed}</p>
                    </div>
                  )}

                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="rounded-[22px] border border-[#e2d0bd] bg-white p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5a39]">Giá variants</p>
                      <div className="mt-3 space-y-2.5">
                        {selectedProduct.variants.map((variant) => {
                          const variantPrice = parseNumber(variant.price);
                          const basePrice = parseNumber(selectedProduct.price);
                          const delta = variantPrice - basePrice;

                          return (
                            <div key={variant.id || variant.name} className="flex items-center justify-between rounded-2xl border border-[#efdfcf] bg-[#fff8ef] px-3 py-2.5">
                              <div>
                                <p className="text-sm font-bold text-[#3a2318]">{variant.name}</p>
                                {variant.isDefault ? <p className="text-[11px] text-[#8c6852]">Mặc định</p> : null}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-[#8f4f2d]">{formatCurrency(variantPrice)}</p>
                                {delta > 0 ? <p className="text-[11px] text-[#8c6852]">+{formatCurrency(delta)}</p> : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={clearSelectedProduct}
                    className="w-full rounded-full bg-[#8f4f2d] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_30px_-18px_rgba(66,35,20,0.9)] transition hover:bg-[#764027]"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
