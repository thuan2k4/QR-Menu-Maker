import { motion } from 'motion/react';
import { useMenuContext } from '../../MenuProvider';

interface ProductFluidCardProps {
  product: any;
  index?: number;
}

export default function ProductFluidCard({ product, index = 0 }: ProductFluidCardProps) {
  const { selectProduct, getProductDisplayPrice } = useMenuContext();

  return (
    <motion.button
      onClick={() => selectProduct(product)}
      className="group w-full text-left overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-black/5"
      style={{ backgroundColor: '#F8F7F5' }}
      aria-label={`Xem chi tiết ${product.name}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 8, boxShadow: '0 20px 40px rgba(26, 26, 26, 0.15)' }}
      transition={{
        type: 'spring',
        stiffness: 250,
        damping: 25,
        delay: index * 0.06,
      }}
    >
      <div className="flex flex-col sm:flex-row gap-6 p-6">
        {/* Product Image - Organic Blob Shape */}
        <motion.div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: '140px', height: '140px' }}
          whileHover={{ scale: 1.05 }}
        >
          {/* Blob background */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 140 140"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="blur-fluid">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>
            <path
              d="M 70 20 Q 100 30 110 60 Q 115 80 100 110 Q 70 125 40 110 Q 20 80 30 60 Q 40 30 70 20"
              fill="#6B6B6B"
              opacity="0.15"
              filter="url(#blur-fluid)"
            />
          </svg>

          {/* Image */}
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              borderRadius: '50% 45% 55% 48% / 48% 55% 45% 50%',
              backgroundColor: '#E8E6E0'
            }}
          >
            {product.imageUrl ? (
              <motion.img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <span className="text-4xl font-black" style={{ color: '#6B6B6B' }}>
                ◆
              </span>
            )}
          </div>

          {/* Hover state - "View Details" */}
          <motion.div
            className="absolute inset-0 backdrop-blur-sm flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              borderRadius: 'inherit',
              backgroundColor: 'rgba(26, 26, 26, 0.7)'
            }}
          >
            <span className="text-white font-bold text-xs">Xem chi tiết</span>
          </motion.div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          className="flex-1 flex flex-col justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.06 + 0.05 }}
        >
          {/* Header: Name + Category */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3
                  className="font-black text-lg leading-tight line-clamp-2"
                  style={{ color: '#1A1A1A' }}
                >
                  {product.name}
                </h3>

                {product.category && (
                  <motion.p
                    className="text-xs font-bold mt-1 uppercase tracking-wider"
                    style={{ color: '#6B6B6B' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.06 + 0.1 }}
                  >
                    • {product.category}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Description */}
            {product.shortDescription && (
              <p
                className="text-sm font-medium line-clamp-2 leading-relaxed"
                style={{ color: '#4A4A4A' }}
              >
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Footer: Price + CTA */}
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-black/5">
            {/* Price Display */}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black" style={{ color: '#1A1A1A' }}>
                {getProductDisplayPrice(product)}
              </span>
            </div>

            {/* CTA Button - Organic Wavy Shape */}
            <motion.span
              className="inline-flex min-h-[40px] items-center flex-shrink-0 font-bold text-xs px-4 py-2 rounded-full transition-all uppercase tracking-[0.08em]"
              style={{
                backgroundColor: '#1A1A1A',
                color: '#F8F7F5',
                borderRadius: '50px'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Chi tiết
            </motion.span>
          </div>

          {/* Hashtags Row */}
          {product.hashtags && product.hashtags.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-1.5 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.06 + 0.15 }}
            >
              {product.hashtags.slice(0, 3).map((tag: string, idx: number) => (
                <motion.span
                  key={`${product.id}-${idx}`}
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: '#E8E6E0',
                    color: '#6B6B6B'
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.06 + 0.15 + idx * 0.03 }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.button>
  );
}
