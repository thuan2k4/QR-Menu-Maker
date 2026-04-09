import { Smartphone } from 'lucide-react';
import { Product } from '../../../../types';
import { useMenuContext } from '../../MenuProvider';
import { useTranslation } from '../../../../i18n';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const {
    primaryColor,
    borderRadius,
    typography,
    selectedTemplate,
    selectProduct,
    getProductDisplayPrice,
  } = useMenuContext();

  const isSplitLayout = selectedTemplate.layout === 'split';
  const shapeClass = selectedTemplate.cardStyle === 'outline'
    ? 'rounded-[2rem] border-2 shadow-none'
    : selectedTemplate.cardStyle === 'solid'
      ? 'rounded-[2rem] border shadow-md'
      : 'rounded-[2rem] border shadow-sm hover:shadow-md';

  const cardStyle = selectedTemplate.cardStyle === 'outline'
    ? { borderColor: `${primaryColor}55` }
    : selectedTemplate.cardStyle === 'solid'
      ? { backgroundColor: '#ffffff', borderColor: `${primaryColor}22` }
      : {};

  const showCardImage = Boolean(product.imageUrl);

  return (
    <button
      type="button"
      onClick={() => selectProduct(product)}
      className={`flex flex-col rounded-[32px] w-full overflow-hidden bg-white p-4 transition-all text-left focus-visible:ring-2 focus-visible:ring-orange-300 cursor-pointer active:scale-[0.98]`}
      style={cardStyle}
      aria-label={t('menuUi.viewProductDetailsAria', { productName: product.name })}
    >
      <div className={`w-full h-52 rounded-[32px] bg-gray-50 overflow-hidden border border-gray-50`}>

        {showCardImage ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain object-center" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#f8fafc', color: primaryColor }}>
            <Smartphone size={24} />
          </div>
        )}
      </div>
      <div className=" flex flex-col justify-between py-1 min-w-0">
        <div>
          <h3 className={`${typography.productName} font-bold text-gray-900 line-clamp-2 break-words pr-2 leading-snug`}>{product.name}</h3>
          <p className={`${typography.productDescription} text-gray-500 line-clamp-2 mt-1 leading-relaxed`}>{product.shortDescription || product.description || ''}</p>
          {product.hashtags && product.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.hashtags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 flex">
          <span className={`${typography.price}text-md py-1 px-3 bg-black text-gray-300 rounded-[32px] font-bold block break-words leading-tight`}>
            {getProductDisplayPrice(product)}
          </span>
        </div>
      </div>
    </button>
  );
}
