import { Smartphone } from 'lucide-react';
import { Product } from '../../../../types';
import { useMenuContext } from '../../MenuProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    primaryColor,
    borderRadius,
    typography,
    selectedTemplate,
    selectProduct,
    getProductDisplayPrice,
  } = useMenuContext();

  const isSplitLayout = selectedTemplate.layout === 'split';
  const shapeClass = selectedTemplate.cardStyle === 'outline' ? 'rounded-3xl border-2 shadow-none' : selectedTemplate.cardStyle === 'solid' ? 'rounded-3xl border shadow-md' : 'rounded-3xl border shadow-sm hover:shadow-md';
  const cardStyle = selectedTemplate.cardStyle === 'outline'
    ? { borderColor: `${primaryColor}55`, borderRadius }
    : selectedTemplate.cardStyle === 'solid'
      ? { backgroundColor: '#ffffff', borderColor: `${primaryColor}22`, borderRadius }
      : { borderRadius };

  const showCardImage = Boolean(product.imageUrl);

  return (
    <button
      type="button"
      onClick={() => selectProduct(product)}
      className={`w-full overflow-hidden bg-white p-4 transition-all text-left ${shapeClass} ${isSplitLayout ? 'flex flex-col gap-3' : 'flex items-center gap-4'} cursor-pointer active:scale-[0.98]`}
      style={cardStyle}
    >
      <div className={`${isSplitLayout ? 'w-full h-40 rounded-2xl' : 'w-24 h-24 rounded-xl flex-shrink-0'} bg-gray-50 overflow-hidden border border-gray-50`} style={{ borderRadius, minWidth: isSplitLayout ? undefined : '96px' }}>
        {showCardImage ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#f8fafc', color: primaryColor }}>
            <Smartphone size={24} />
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div>
          <h3 className={`${typography.productName} font-bold text-gray-900 line-clamp-2 break-words pr-2 leading-snug`}>{product.name}</h3>
          <p className={`${typography.productDescription} text-gray-400 line-clamp-2 mt-1 leading-relaxed`}>{product.shortDescription || product.description || ''}</p>
          {product.hashtags && product.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.hashtags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2">
          <span className={`${typography.price} font-bold block break-words leading-tight`} style={{ color: primaryColor }}>
            {getProductDisplayPrice(product)}
          </span>
        </div>
      </div>
    </button>
  );
}
