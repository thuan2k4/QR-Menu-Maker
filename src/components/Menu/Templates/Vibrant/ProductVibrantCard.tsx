import { motion } from 'motion/react';
import { useMenuContext } from '../../MenuProvider';

interface ProductVibrantCardProps {
  product: any;
  index?: number;
}

export default function ProductVibrantCard({ product, index = 0 }: ProductVibrantCardProps) {
  const { selectProduct, getProductDisplayPrice } = useMenuContext();

  return (
    <motion.button
      onClick={() => selectProduct(product)}
      className="group text-left overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 border-2 border-orange-200 hover:border-orange-400"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: index * 0.08,
      }}
    >
      {/* Image Container with Overlay */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
        {product.imageUrl ? (
          <>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain object-center group-hover:scale-125 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            {/* Hover Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-orange-900/60 via-orange-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <span className="text-white font-black text-sm">Xem chi tiết</span>
            </motion.div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-orange-300 text-6xl font-black">
            🍔
          </div>
        )}

        {/* Category Badge */}
        {product.category && (
          <motion.div
            className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.08 + 0.1, type: 'spring', stiffness: 300 }}
          >
            {product.category}
          </motion.div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3">
        {/* Product Name */}
        <h3 className="font-black text-gray-900 text-base line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Price Display - Bold */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
            {getProductDisplayPrice(product)}
          </span>
        </div>

        {/* Short Description */}
        {product.shortDescription || product.description ? (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-medium">
            {product.shortDescription?.trim() || product.description?.trim()}
          </p>
        ) : null}

        {/* Hashtags */}
        {product.hashtags && product.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {product.hashtags.map((tag: string, idx: number) => (
              <span key={idx} className="text-xs text-gray-500 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <motion.div
          className="mt-4 w-full py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm text-center shadow-md group-hover:shadow-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Xem chi tiết
        </motion.div>
      </div>
    </motion.button>
  );
}
