import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useMenuContext } from '../../MenuProvider';
import { useState } from 'react';

interface ProductFluidModalProps {
  product: any;
  onClose: () => void;
}

export default function ProductFluidModal({ product, onClose }: ProductFluidModalProps) {
  const { getProductDetailDescription, getProductDisplayPrice, formatCurrency } = useMenuContext();
  const [selectedVariant, setSelectedVariant] = useState<string | number | null>(null);

  const detailDescription = getProductDetailDescription(product);
  const displayPrice = getProductDisplayPrice(product);

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const parsePrice = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '.');
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : NaN;
    }
    return NaN;
  };

  const formatVariantPrice = (variant: any) => {
    const explicitPrice = parsePrice(variant.price);
    if (Number.isFinite(explicitPrice)) {
      return formatCurrency(explicitPrice);
    }

    const modifierPrice = parsePrice(variant.priceModifier);
    if (Number.isFinite(modifierPrice)) {
      const sign = modifierPrice >= 0 ? '+' : '-';
      return `${sign}${formatCurrency(Math.abs(modifierPrice))}`;
    }

    return null;
  };

  return (
    <motion.div
      className="w-full sm:max-w-2xl max-h-[calc(100dvh-2rem)] rounded-3xl overflow-hidden shadow-2xl border border-black/5"
      style={{ backgroundColor: '#F8F7F5' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        {/* Close Button - Floating */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: 'rgba(26, 26, 26, 0.8)',
            borderColor: '#1A1A1A'
          }}
          aria-label="Chi tiết sản phẩm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X size={20} style={{ color: '#F8F7F5' }} />
        </motion.button>

        {/* Product Image - Large Organic Shape */}
        <motion.div
          className="relative h-52 sm:h-72 shrink-0 overflow-hidden"
          style={{ backgroundColor: '#E8E6E0' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Decorative blob */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 400 320"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <filter id="blob-shadow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
              </filter>
            </defs>
            <path
              d="M 200 80 Q 300 100 340 170 Q 350 220 300 280 Q 200 310 100 280 Q 50 220 60 170 Q 100 100 200 80"
              fill="#6B6B6B"
              opacity="0.1"
              filter="url(#blob-shadow)"
            />
          </svg>

          {product.imageUrl && (
            <motion.img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

        </motion.div>

        {/* Content Section */}
        <motion.div
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Product Header */}
          <div className="space-y-3">
            <h2
              className="text-3xl sm:text-4xl font-black leading-tight"
              style={{ color: '#1A1A1A' }}
            >
              {product.name}
            </h2>

            {/* Price Display - Prominent */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-3xl font-black"
                style={{ color: '#1A1A1A' }}
              >
                {displayPrice}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ backgroundColor: 'rgba(107, 107, 107, 0.2)' }} />

          {/* Description */}
          {detailDescription && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: '#6B6B6B' }}
              >
                Mô tả sản phẩm
              </p>
              <p
                className="text-base font-medium leading-relaxed"
                style={{ color: '#4A4A4A' }}
              >
                {detailDescription}
              </p>
            </motion.div>
          )}

          {/* Hashtags */}
          {product.hashtags && product.hashtags.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {product.hashtags.map((tag: string, idx: number) => (
                <motion.span
                  key={`${product.id}-${idx}`}
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: '#E8E6E0',
                    color: '#4A4A4A'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* Divider */}
          {hasVariants && <div className="h-px" style={{ backgroundColor: 'rgba(107, 107, 107, 0.2)' }} />}

          {/* Variants Section */}
          {hasVariants && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: '#6B6B6B' }}
              >
                ◆ Biến thể và lựa chọn
              </p>

              <div className="space-y-3">
                {variants.map((variant: any, idx: number) => (
                  (() => {
                    const variantKey = variant.id ?? `${product.id}-variant-${idx}`;
                    const isSelected = selectedVariant === variantKey;
                    const variantPrice = formatVariantPrice(variant);
                    return (
                      <motion.button
                        key={variantKey}
                        onClick={() => setSelectedVariant(isSelected ? null : variantKey)}
                        className="w-full p-4 rounded-xl border-2 transition-all text-left"
                        style={{
                          borderColor: isSelected ? '#1A1A1A' : '#E8E6E0',
                          backgroundColor: isSelected ? '#F0EEEB' : 'transparent'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p
                                className="font-bold"
                                style={{ color: '#1A1A1A' }}
                              >
                                {variant.name}
                              </p>
                              {(variant.isDefault || idx === 0) && (
                                <span
                                  className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]"
                                  style={{ color: '#1A1A1A' }}
                                >
                                  Mặc định
                                </span>
                              )}
                            </div>
                            {variant.description && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: '#6B6B6B' }}
                              >
                                {variant.description}
                              </p>
                            )}
                          </div>
                          {variantPrice && (
                            <p
                              className="font-black ml-4 whitespace-nowrap text-sm"
                              style={{ color: '#1A1A1A' }}
                            >
                              {variantPrice}
                            </p>
                          )}
                        </div>

                        {/* Expanded content */}
                        {isSelected && variant.options && (
                          <motion.div
                            className="mt-4 space-y-2 border-t pt-4"
                            style={{ borderColor: 'rgba(107, 107, 107, 0.1)' }}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            {variant.options.map((option: any, optIdx: number) => (
                              <div
                                key={`${variant.id}-option-${optIdx}`}
                                className="text-xs font-medium"
                                style={{ color: '#4A4A4A' }}
                              >
                                • {option.name}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })()
                ))}
              </div>
            </motion.div>
          )}

          {/* Divider before CTA */}
          <div className="h-px" style={{ backgroundColor: 'rgba(107, 107, 107, 0.2)' }} />

          {/* CTA Button */}
          <motion.div
            className="pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={onClose}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl font-bold border-2 transition-all"
              style={{
                borderColor: '#1A1A1A',
                backgroundColor: '#1A1A1A',
                color: '#F8F7F5'
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Đóng
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
