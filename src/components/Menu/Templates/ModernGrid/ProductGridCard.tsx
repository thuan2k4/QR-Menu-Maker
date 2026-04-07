import { Smartphone } from 'lucide-react';
import { Product } from '../../../../types';
import { useMenuContext } from '../../MenuProvider';

interface ProductGridCardProps {
  product: Product;
}

export default function ProductGridCard({ product }: ProductGridCardProps) {
  const { primaryColor, getProductDisplayPrice, selectProduct } = useMenuContext();
  const badgeLabel = product.hashtags && product.hashtags.length > 0 ? product.hashtags[0] : '';

  return (
    <button
      type="button"
      onClick={() => selectProduct(product)}
      className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-300"
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <Smartphone size={32} />
          </div>
        )}
      </div>
      <div className="px-4 py-5 text-left">
        {badgeLabel ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 mb-3">{badgeLabel}</span>
        ) : null}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.shortDescription || product.description}</p>
        <div className="flex items-center justify-between gap-4">
          <div className="text-lg font-bold" style={{ color: primaryColor }}>
            {getProductDisplayPrice(product)}
          </div>
          <span className="rounded-2xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">Chi tiết</span>
        </div>
      </div>
    </button>
  );
}
