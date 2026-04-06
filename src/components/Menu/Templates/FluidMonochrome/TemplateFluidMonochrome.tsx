import { AnimatePresence, motion } from 'motion/react';
import { useMenuContext } from '../../MenuProvider';
import ProductFluidCard from './ProductFluidCard';
import ProductFluidModal from './ProductFluidModal';
import PrivatePreviewInlineNotice from '../../PrivatePreviewInlineNotice';

export default function TemplateFluidMonochrome() {
  const {
    filteredProducts,
    categories,
    activeCategory,
    setActiveCategory,
    store,
    selectedProduct,
    clearSelectedProduct,
  } = useMenuContext();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7F5' }}>
      {/* SVG Background Pattern - subtle texture */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none opacity-40"
        style={{ backgroundColor: '#F8F7F5' }}
      >
        <defs>
          <pattern id="noise" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="1" fill="#6B6B6B" opacity="0.1" />
            <circle cx="75" cy="75" r="1" fill="#6B6B6B" opacity="0.1" />
            <circle cx="75" cy="25" r="0.5" fill="#6B6B6B" opacity="0.05" />
            <circle cx="25" cy="75" r="0.5" fill="#6B6B6B" opacity="0.05" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#noise)" />
      </svg>

      {/* Hero Section with Cover */}
      <div className="relative overflow-hidden pt-0">
        {store?.coverUrl ? (
          <motion.div
            className="relative h-64 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={store.coverUrl}
              alt="Cover"
              className="h-full w-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
          </motion.div>
        ) : (
          <div
            className="h-64 bg-gradient-to-br"
            style={{ backgroundColor: '#4A4A4A' }}
          />
        )}

        {/* Store Info - Floating Card */}
        <motion.div
          className="relative mx-auto max-w-5xl px-4 sm:px-6 -mt-32 mb-16 z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30, delay: 0.2 }}
        >
          <div
            className="rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md border border-black/5"
            style={{ backgroundColor: '#F8F7F5' }}
          >
            <div
              className="p-8 sm:p-10"
              style={{ backgroundColor: '#F8F7F5' }}
            >
              <div className="flex flex-col sm:flex-row items-start gap-8">
                {/* Logo - Organic Shape */}
                <motion.div
                  className="flex-shrink-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 250, delay: 0.3 }}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg flex items-center justify-center border-2"
                    style={{
                      borderColor: '#1A1A1A',
                      backgroundColor: '#6B6B6B'
                    }}
                  >
                    {store?.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-4xl font-black" style={{ color: '#F8F7F5' }}>
                        {store?.name?.charAt(0) || '✦'}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Store Details */}
                <motion.div
                  className="flex-1 space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 250, delay: 0.4 }}
                >
                  <div>
                    <p
                      className="text-xs font-black uppercase tracking-[0.15em]"
                      style={{ color: '#6B6B6B' }}
                    >
                      ✧ Xin chào
                    </p>
                    <h1 className="text-4xl font-black leading-tight mt-2" style={{ color: '#1A1A1A' }}>
                      {store?.name || 'Menu'}
                    </h1>
                  </div>

                  <div className="space-y-3 text-sm">
                    {store?.address && (
                      <p className="flex items-center gap-3 font-bold" style={{ color: '#4A4A4A' }}>
                        <span style={{ color: '#1A1A1A' }}>📍</span>
                        {store.address}
                      </p>
                    )}
                    {store?.phone && (
                      <p className="flex items-center gap-3 font-bold" style={{ color: '#4A4A4A' }}>
                        <span style={{ color: '#1A1A1A' }}>☎️</span>
                        {store.phone}
                      </p>
                    )}
                  </div>

                  {store?.bio && (
                    <p
                      className="text-sm leading-relaxed font-medium pt-2"
                      style={{ color: '#6B6B6B' }}
                    >
                      {store.bio}
                    </p>
                  )}
                  <PrivatePreviewInlineNotice className="border-[#cfc9be] bg-[#f1efea] text-[#3f3f3f]" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pb-16 space-y-12 z-0">
        {/* Section Header */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.15em]"
              style={{ color: '#6B6B6B' }}
            >
              ◆ Danh mục
            </p>
            <h2 className="text-3xl font-black mt-2" style={{ color: '#1A1A1A' }}>
              Hôm nay của bạn thế nào?
            </h2>
          </div>

          {/* Category Buttons - Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {categories.map((cat, idx) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-6 py-2.5 min-h-[44px] rounded-full font-bold text-sm whitespace-nowrap flex-shrink-0 transition-all border-2 capitalize"
                style={{
                  backgroundColor: activeCategory === cat.id ? '#1A1A1A' : 'transparent',
                  color: activeCategory === cat.id ? '#F8F7F5' : '#4A4A4A',
                  borderColor: activeCategory === cat.id ? '#1A1A1A' : '#6B6B6B'
                }}
                aria-pressed={activeCategory === cat.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: idx * 0.04, type: 'spring', stiffness: 300 }}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Products - Vertical Stack */}
        <div>
          {filteredProducts.length > 0 ? (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {filteredProducts.map((product, idx) => (
                <ProductFluidCard key={product.id} product={product} index={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="rounded-3xl border-2 border-dashed p-16 text-center"
              style={{
                borderColor: '#6B6B6B',
                backgroundColor: 'rgba(107, 107, 107, 0.05)'
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="font-black text-lg" style={{ color: '#1A1A1A' }}>
                Khong co san pham trong danh muc nay
              </p>
              <p
                className="mt-2 text-sm"
                style={{ color: '#6B6B6B' }}
              >
                Hay chon danh muc khac de xem menu
              </p>
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
              className="fixed inset-0 z-40 backdrop-blur-md"
              style={{ backgroundColor: 'rgba(26, 26, 26, 0.6)' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            >
              <ProductFluidModal
                product={selectedProduct}
                onClose={clearSelectedProduct}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
