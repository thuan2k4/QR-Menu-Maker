import { MapPin, Phone, Info, Smartphone } from 'lucide-react';
import { useMenuContext } from '../../MenuProvider';
import PrivatePreviewInlineNotice from '../../PrivatePreviewInlineNotice';

export default function Header() {
  const {
    store,
    primaryColor,
    typography,
    rootStyle,
    borderRadius,
    showProductImages,
  } = useMenuContext();

  if (!store) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-10">
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0 -mt-16">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-xl">
                {store.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`${typography.storeTitle} font-bold text-gray-900 truncate`} style={{ fontFamily: rootStyle.fontFamily as string }}>
              {store.name}
            </h1>
            <div className="flex flex-col gap-1 mt-1">
              {store.address && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={12} style={{ color: primaryColor }} />
                  {store.address}
                </p>
              )}
              {store.phone && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone size={12} style={{ color: primaryColor }} />
                  {store.phone}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{store.bio}</p>
            <PrivatePreviewInlineNotice />
          </div>
        </div>
      </div>
    </div>
  );
}
