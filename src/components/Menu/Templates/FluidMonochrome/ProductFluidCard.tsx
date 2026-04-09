import { motion } from 'motion/react';
import { useMenuContext } from '../../MenuProvider';
import { useTranslation } from '../../../../i18n';

interface ProductFluidCardProps {
  product: any;
  index?: number;
}

export default function ProductFluidCard({ product, index = 0 }: ProductFluidCardProps) {
  const { t } = useTranslation();
  const { selectProduct, getProductDisplayPrice } = useMenuContext();

  return (
    <motion.button
      onClick={() => selectProduct(product)}
      className="group w-full text-left overflow-hidden rounded-[26px] border border-[#e0dbd1] bg-white shadow-sm transition-all duration-300 hover:shadow-md"
      aria-label={t('menuUi.viewProductDetailsAria', { productName: product.name })}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{
        type: 'spring',
        stiffness: 250,
        damping: 25,
        delay: index * 0.06,
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[90px_1fr] p-6">
        <div className="relative h-82 w-full overflow-hidden rounded-[24px] border border-[#ccc7bd] bg-[#e6e2d9]">
          {product.imageUrl ? (
            <motion.img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover object-center"
              referrerPolicy="no-referrer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-black text-[#6B6B6B]">
              ◆
            </div>
          )}
        </div>

        <motion.div
          className="flex flex-col justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.06 + 0.05 }}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-base font-black" style={{ color: '#1A1A1A' }}>
                  {product.name}
                </h3>
                {product.category && (
                  <motion.p
                    className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6B6B6B]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.06 + 0.1 }}
                  >
                    • {product.category}
                  </motion.p>
                )}
              </div>
            </div>

            {product.shortDescription && (
              <p className="line-clamp-2 text-[11px] font-medium leading-relaxed" style={{ color: '#4A4A4A' }}>
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4 md:pt-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[16px] font-black" style={{ color: '#1A1A1A' }}>
                {getProductDisplayPrice(product)}
              </p>
              <span className="inline-flex items-center rounded-full border border-[#1A1A1A] bg-[#1A1A1A] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#F8F7F5]">
                {t('menuUi.viewDetails')}
              </span>
            </div>

            {product.hashtags && product.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.hashtags.slice(0, 3).map((tag: string, idx: number) => (
                  <span key={`${product.id}-${idx}`} className="rounded-full bg-[#efebe4] px-2 py-1 text-[9px] font-black text-[#666259]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.button>
  );
}
