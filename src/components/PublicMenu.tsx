import { useParams } from 'react-router-dom';
import { MenuProvider } from './Menu/MenuProvider';
import { useMenuContext } from './Menu/MenuProvider';
import MenuRenderer from './Menu/MenuRenderer';
import PublicMenuFilterSortControls from './Menu/PublicMenuFilterSortControls';
import { Info, Smartphone } from 'lucide-react';
import { useEffect } from 'react';
import type { CSSProperties } from 'react';

function PublicMenuContent() {
  const { loading, store, menuVisibility, isOwner, rootStyle, sizePreset, primaryColor, secondaryColor } = useMenuContext();
  const isPrivateMenu = menuVisibility !== 'public';

  useEffect(() => {
    const rootElement = document.documentElement;
    const previousFontSize = rootElement.style.fontSize;

    if (sizePreset === 'large') {
      rootElement.style.fontSize = '17px';
    } else if (sizePreset === 'compact') {
      rootElement.style.fontSize = '15px';
    } else {
      rootElement.style.fontSize = '16px';
    }

    return () => {
      rootElement.style.fontSize = previousFontSize;
    };
  }, [sizePreset]);

  const themedStyle: CSSProperties = {
    fontFamily: rootStyle.fontFamily,
    color: rootStyle.color,
    backgroundColor: rootStyle.backgroundColor,
    backgroundImage: rootStyle.backgroundImage,
    ['--menu-primary' as string]: primaryColor,
    ['--menu-secondary' as string]: secondaryColor,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <Smartphone className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Khong tim thay Menu</h1>
        <p className="text-gray-500 mt-2">Vui long kiem tra lai ma QR hoac duong dan.</p>
      </div>
    );
  }

  if (isPrivateMenu && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
          <Info size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Menu dang trong trang thai cap nhat, vui long quay lai sau.</h1>
        <p className="text-gray-500 mt-2"></p>
      </div>
    );
  }

  return (
    <div style={themedStyle}>
      <PublicMenuFilterSortControls
        disabled={isPrivateMenu}
        disabledReason="Filter/Sort tam khoa khi menu dang o che do Private."
      />
      <MenuRenderer />
    </div>
  );
}

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  return (
    <MenuProvider slug={slug}>
      <PublicMenuContent />
    </MenuProvider>
  );
}
