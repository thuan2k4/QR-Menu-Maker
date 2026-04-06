import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, MapPin, Phone, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMenuContext } from '../../MenuProvider';
import PrivatePreviewInlineNotice from '../../PrivatePreviewInlineNotice';

type ProductDisplayMode = 'gallery' | 'compact';

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

export default function TemplateCoffeeAtelier() {
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

  const [displayMode, setDisplayMode] = useState<ProductDisplayMode>('gallery');

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

  const cardsClassName = displayMode === 'gallery' ? 'grid gap-5 lg:grid-cols-2' : 'space-y-4';

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#ece7df] text-[#1b150f]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(53,44,34,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(53,44,34,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(199,124,70,0.22)_0%,rgba(236,231,223,0)_34%),radial-gradient(circle_at_92%_82%,rgba(25,20,15,0.24)_0%,rgba(236,231,223,0)_40%)]" />

      <div className="relative h-[340px] overflow-hidden border-b-2 border-[#2a2118] sm:h-[420px]">
        {store?.coverUrl ? (
          <img
            src={store.coverUrl}
            alt="Cover"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_#ba7c4e_0%,_#7d4e2f_52%,_#2a1f16_100%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-[#201810]/28 via-[#1a140f]/58 to-[#120e0a]/82" />

        <div className="absolute inset-x-0 top-4 mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="inline-flex border border-[#e5c8aa]/65 bg-[#1d1610]/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#f6e2cf] backdrop-blur-sm">
            Coffee Atelier
          </div>
          <div className="inline-flex border border-[#e5c8aa]/65 bg-[#1d1610]/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#f6e2cf] backdrop-blur-sm">
            Issue 01
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-2 text-[#fff6ed] sm:grid-cols-[1.2fr_auto] sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f2d7bd]">Editorial Menu</p>
              <h1 className="mt-2 text-4xl font-black uppercase leading-[0.95] tracking-[0.08em] sm:text-7xl">Order Coffee</h1>
            </div>
            <p className="max-w-xs border-l-2 border-[#f0d0b2] pl-3 text-sm font-semibold italic text-[#f4dcc5] sm:text-right sm:border-l-0 sm:border-r-2 sm:pl-0 sm:pr-3">
              Fresh beans, bold flavors, crafted for everyday rituals.
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto -mt-10 w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
          className="border-2 border-[#20170f] bg-[#f7f2e9] p-5 shadow-[12px_12px_0_0_rgba(31,23,15,0.25)]"
        >
          <div className="grid gap-4 md:grid-cols-[92px_minmax(0,1fr)_auto] md:items-start">
            <div className="h-20 w-20 overflow-hidden border-2 border-[#1f1610] bg-[#dfd2c2] md:h-24 md:w-24">
              {store?.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt="Logo"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-black text-[#8a5634]">
                  {(store?.name || 'C').charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b06d3c]">Fresh Batch Daily</p>
              <h2 className="line-clamp-2 text-3xl font-black leading-tight text-[#1a130d] sm:text-4xl">{store?.name || 'Coffee Shop'}</h2>

              {(store?.address || store?.phone) && (
                <div className="space-y-1 text-sm font-semibold text-[#5b3f2b]">
                  {store?.address ? (
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#be7844]" />
                      <span>{store.address}</span>
                    </p>
                  ) : null}
                  {store?.phone ? (
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-[#be7844]" />
                      <span>{store.phone}</span>
                    </p>
                  ) : null}
                </div>
              )}

              {store?.bio ? <p className="pt-1 text-sm font-medium text-[#6a4b34]">{store.bio}</p> : null}
              <PrivatePreviewInlineNotice className="border-[#d8bda4] bg-[#fdf3e7] text-[#6a3f24]" />
            </div>

            <div className="inline-flex h-fit items-center gap-2 border-2 border-[#1f1610] bg-[#1f1610] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#f8e8d6]">
              <span className="h-2 w-2 bg-[#f19b58]" />
              Open Everyday
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.38 }}
          className="mt-6 border-2 border-[#21180f] bg-[#1d1711] p-5 text-[#f6ece0] shadow-[12px_12px_0_0_rgba(31,23,15,0.25)]"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f0bc8f]">Danh Mục</p>
              <h3 className="mt-2 text-3xl font-black text-white sm:text-[2rem]">Chọn sản phẩm bạn muốn thử</h3>
            </div>

            <div className="inline-flex justify-self-start border border-[#3f3328] bg-[#2b2118] p-1">
              {[
                { id: 'gallery', label: 'Thẻ lớn' },
                { id: 'compact', label: 'Thẻ gọn' },
              ].map((mode) => {
                const active = displayMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setDisplayMode(mode.id as ProductDisplayMode)}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-[0.1em] transition ${active
                      ? 'bg-[#c7773d] text-[#1f130b]'
                      : 'text-[#f2dbc7] hover:bg-[#3a2d22]'
                      }`}
                  >
                    {mode.label}
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
                  className={`border px-4 py-2 text-sm font-black transition ${active
                    ? 'border-[#c7773d] bg-[#c7773d] text-[#22150d]'
                    : 'border-[#58473a] bg-[#241b14] text-[#f8e9da] hover:border-[#d09164]'
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
          transition={{ delay: 0.12, duration: 0.38 }}
          className="mt-6"
        >
          {filteredProducts.length > 0 ? (
            <div className={cardsClassName}>
              {filteredProducts.map((product, idx) => {
                const compact = displayMode === 'compact';

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`group border-2 border-[#21170f] bg-[#fffaf3] ${compact ? 'flex gap-4 p-4' : 'overflow-hidden'} shadow-[8px_8px_0_0_rgba(33,23,15,0.2)]`}
                  >
                    {product.imageUrl ? (
                      <div className={`${compact ? 'h-28 w-28 flex-shrink-0 border-2 border-[#21170f]' : 'relative h-56 w-full'} overflow-hidden bg-[#ebddcc]`}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className={`${compact ? 'h-28 w-28 flex-shrink-0 border-2 border-[#21170f]' : 'h-56 w-full'} bg-[radial-gradient(circle_at_top_left,_#ecdac6_0%,_#c48758_56%,_#7c4d2d_100%)]`} />
                    )}

                    <div className={`${compact ? 'min-w-0 flex-1 space-y-2' : 'space-y-3 p-4'} min-w-0`}>
                      <h4 className="line-clamp-1 text-2xl font-black text-[#1f150d]">{product.name}</h4>
                      {product.shortDescription || product.description ? (
                        <p className="line-clamp-2 text-sm font-medium text-[#644832]">
                          {product.shortDescription?.trim() || product.description?.trim()}
                        </p>
                      ) : null}

                      {product.hashtags && product.hashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {product.hashtags.slice(0, 4).map((tag) => (
                            <span
                              key={`${product.id}-${tag}`}
                              className="border border-[#e2d0bc] bg-[#f5ebdd] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#825233]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-end justify-between gap-2 pt-1">
                        <p className="text-2xl font-black text-[#9e5e35]">{getProductDisplayPrice(product)}</p>
                        <button
                          type="button"
                          onClick={() => selectProduct(product)}
                          className="inline-flex items-center gap-1.5 border-2 border-[#271c12] bg-[#271c12] px-3 py-2 text-xs font-black uppercase tracking-[0.09em] text-[#f5e6d4] transition hover:bg-[#c7773d] hover:text-[#271c12]"
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
            <div className="border-2 border-dashed border-[#bda288] bg-[#f8f1e7] p-10 text-center">
              <p className="text-lg font-black text-[#6c452c]">Danh mục này chưa có sản phẩm</p>
              <p className="mt-2 text-sm font-semibold text-[#8a5b3c]">Hãy chuyển sang danh mục khác để tiếp tục khám phá.</p>
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
              className="fixed inset-0 z-50 bg-[#17110b]/72 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
            >
              <div className="w-full max-w-5xl overflow-hidden border-2 border-[#1f150d] bg-[#fff8ef] shadow-[16px_16px_0_0_rgba(31,21,13,0.28)]">
                <div className="grid max-h-[90vh] overflow-hidden lg:grid-cols-[1.1fr_1fr]">
                  <div className="relative h-64 border-b-2 border-[#1f150d] bg-[#e5d4c2] lg:h-auto lg:border-b-0 lg:border-r-2">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_#ecdac6_0%,_#c48758_56%,_#7c4d2d_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#19120d]/74 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#edcfb0]">Chi tiết sản phẩm</p>
                      <h4 className="mt-1 text-3xl font-black text-white">{selectedProduct.name}</h4>
                      <p className="mt-2 text-2xl font-black text-[#ffd8b2]">{getProductDisplayPrice(selectedProduct)}</p>
                    </div>
                  </div>

                  <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5 sm:max-h-[90vh] sm:p-6">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={clearSelectedProduct}
                        className="inline-flex h-9 w-9 items-center justify-center border-2 border-[#1f150d] bg-white text-[#1f150d]"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {selectedProduct.hashtags && selectedProduct.hashtags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.hashtags.map((tag) => (
                          <span
                            key={`detail-${selectedProduct.id}-${tag}`}
                            className="border border-[#e2d0bc] bg-[#f5ebdd] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#825233]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {detailContent.primary ? (
                      <div className="border-2 border-[#d8c1a8] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8d5b3a]">Mô tả</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-[#5f4331]">{detailContent.primary}</p>
                      </div>
                    ) : null}

                    {detailContent.hasSeparateDetail ? (
                      <div className="border-2 border-[#d8c1a8] bg-[#fff2e3] p-4">
                        <p className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#8d5b3a]">
                          <Sparkles size={12} />
                          Mô tả chi tiết
                        </p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-[#5f4331]">{detailContent.detailed}</p>
                      </div>
                    ) : null}

                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      <div className="border-2 border-[#d8c1a8] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8d5b3a]">Giá variants</p>
                        <div className="mt-3 space-y-2.5">
                          {selectedProduct.variants.map((variant, idx) => {
                            const variantPrice = parseNumber(variant.price);
                            const basePrice = parseNumber(selectedProduct.price);
                            const delta = variantPrice - basePrice;

                            return (
                              <div
                                key={`${variant.id || variant.name}-${idx}`}
                                className="flex items-center justify-between border border-[#e4d4c2] bg-[#fff9f1] px-3 py-2.5"
                              >
                                <div>
                                  <p className="text-sm font-black text-[#2a1a10]">{variant.name}</p>
                                  {variant.isDefault ? <p className="text-[11px] font-semibold text-[#8f694d]">Mặc định</p> : null}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-[#9e5e35]">{formatCurrency(variantPrice)}</p>
                                  {delta > 0 ? <p className="text-[11px] font-semibold text-[#8f694d]">+{formatCurrency(delta)}</p> : null}
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
                      className="w-full border-2 border-[#241910] bg-[#241910] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#f3e2d0] transition hover:bg-[#c7773d] hover:text-[#241910]"
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
