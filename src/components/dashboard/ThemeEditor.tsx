import { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Store } from '../../types';
import * as QRCode from 'qrcode.react';
import { CheckCircle, LayoutGrid, LayoutList, Palette, QrCode, RefreshCcw, Save } from 'lucide-react';

type TemplateOption = {
  id: string;
  name: string;
  description: string;
  vibe: string;
  bestFor: string;
};

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Layout danh sách truyền thống.',
    vibe: 'Thân thuộc',
    bestFor: 'Menu nhiều món',
  },
  {
    id: 'modern_grid',
    name: 'Modern Grid',
    description: 'Grid cards, icon categories và banner hiện đại.',
    vibe: 'Hiện đại',
    bestFor: 'Brand trẻ',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Thiết kế sống động với cam sôi động.',
    vibe: 'Năng lượng',
    bestFor: 'Combo nổi bật',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Thiết kế tối giản, sạch sẽ và chuyên nghiệp.',
    vibe: 'Tinh gọn',
    bestFor: 'Tập trung nội dung',
  },
  {
    id: 'bakery',
    name: 'Bakery',
    description: 'Editorial ấm áp, ảnh lớn, phù hợp quán bánh và cà phê.',
    vibe: 'Ấm áp',
    bestFor: 'Ảnh sản phẩm',
  },
  {
    id: 'organic_market',
    name: 'Organic Market',
    description: 'Phong cách panel organic góc cạnh, khác biệt rõ với Bakery.',
    vibe: 'Mộc mạc',
    bestFor: 'Brand organic',
  },
  {
    id: 'coffee_atelier',
    name: 'Coffee Atelier',
    description: 'Hero typography, tông cà phê cao cấp và modal sản phẩm đậm chất studio.',
    vibe: 'Studio',
    bestFor: 'Premium coffee',
  },
  {
    id: 'matcha_signature',
    name: 'Signature Market',
    description: 'Soft editorial bo tròn, nhịp trình bày thoáng và nhận diện tách biệt khỏi Coffee Atelier.',
    vibe: 'Êm dịu',
    bestFor: 'Menu seasonal',
  },
  {
    id: 'botanical_sketch',
    name: 'Botanical Sketchbook',
    description: 'Monotone sketch với chất giấy mộc, card bo mềm và modal chi tiết đầy đủ.',
    vibe: 'Thủ công',
    bestFor: 'Storytelling',
  },
  {
    id: 'fluid_monochrome',
    name: 'Fluid Monochrome',
    description: 'Monochrome hữu cơ, card stack mềm và modal chi tiết kiểu liquid.',
    vibe: 'Tối giản đậm nét',
    bestFor: 'Brand cá tính',
  },
];

interface ThemeEditorProps {
  user: User;
  restaurant: Store | null;
}

type ThemeLayoutType = 'list' | 'grid';

interface ThemeState {
  layoutType: ThemeLayoutType;
  showProductImages: boolean;
  primaryColor: string;
  bgColor: string;
  textColor: string;
  fontFamily: Store['fontFamily'];
  borderRadius: string;
  qrDotColor: string;
  qrBgColor: string;
  currency: Store['currency'];
  templateId: string;
}

const DEFAULT_THEME_STATE: ThemeState = {
  layoutType: 'list',
  showProductImages: true,
  primaryColor: '#ff5722',
  bgColor: '#ffffff',
  textColor: '#1f2937',
  fontFamily: 'Inter',
  borderRadius: '20px',
  qrDotColor: '#111827',
  qrBgColor: '#ffffff',
  currency: 'VND',
  templateId: 'classic',
};

const PREVIEW_PRODUCTS = [
  { id: 'p1', name: 'Cơm Gà Sốt Mơ', description: 'Cơm trắng mềm, gà xé sốt mơ chua ngọt.', price: 79000 },
  { id: 'p2', name: 'Salad Rau Củ Miễn Phí', description: 'Tươi mát, kèm sốt mè rang đặc trưng.', price: 45000 },
  { id: 'p3', name: 'Trà Đá Thơm Lạnh', description: 'Giữ ấm dư vị mùa hè với hương trà tự nhiên.', price: 18000 },
];

const FONT_OPTIONS: Store['fontFamily'][] = ['Inter', 'Roboto', 'Playfair Display', 'Be Vietnam Pro'];

function useThemeStore(initialState: ThemeState) {
  const [theme, setTheme] = useState<ThemeState>(initialState);

  useEffect(() => {
    setTheme(initialState);
  }, [initialState]);

  const updateTheme = (patch: Partial<ThemeState>) => {
    setTheme((prev) => ({ ...prev, ...patch }));
  };

  return { theme, updateTheme, setTheme };
}

export default function ThemeEditor({ user, restaurant }: ThemeEditorProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initialThemeState = useMemo<ThemeState>(() => {
    if (!restaurant) return DEFAULT_THEME_STATE;
    return {
      layoutType: (restaurant.layoutType as ThemeLayoutType) || 'list',
      showProductImages: restaurant.showProductImages !== false,
      primaryColor: restaurant.primaryColor || restaurant.themeColor || '#ff5722',
      bgColor: restaurant.bgColor || restaurant.secondaryColor || '#ffffff',
      textColor: restaurant.textColor || '#1f2937',
      fontFamily: restaurant.fontFamily || 'Inter',
      borderRadius: restaurant.borderRadius || '20px',
      qrDotColor: restaurant.qrDotColor || restaurant.primaryColor || '#111827',
      qrBgColor: restaurant.qrBgColor || restaurant.bgColor || '#ffffff',
      currency: restaurant.currency || 'VND',
      templateId: restaurant.templateId || 'classic',
    };
  }, [restaurant]);

  const { theme, updateTheme } = useThemeStore(initialThemeState);

  const fontFamilyMap: Record<string, string> = {
    Inter: 'Inter, ui-sans-serif, system-ui, sans-serif',
    Roboto: 'Roboto, ui-sans-serif, system-ui, sans-serif',
    'Playfair Display': 'Playfair Display, Georgia, serif',
    'Be Vietnam Pro': 'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif',
  };

  const previewCssVars = {
    '--theme-primary': theme.primaryColor,
    '--theme-bg': theme.bgColor,
    '--theme-text': theme.textColor,
    '--theme-radius': theme.borderRadius,
    '--theme-qr-dot': theme.qrDotColor,
    '--theme-qr-bg': theme.qrBgColor,
  } as React.CSSProperties;

  const currentFontFamily = theme.fontFamily || 'Inter';
  const previewRootStyle = {
    ...previewCssVars,
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-text)',
    fontFamily: fontFamilyMap[currentFontFamily],
    fontSize: '14px',
    lineHeight: 1.5,
    height: '100%',
  } as React.CSSProperties;

  const previewCardStyle = {
    borderRadius: theme.borderRadius,
    borderColor: `${theme.primaryColor}22`,
    backgroundColor: '#ffffff',
  } as const;

  const productGridClass = 'space-y-4';
  const isModernGridPreview = theme.templateId === 'modern_grid';
  const isVibrantPreview = theme.templateId === 'vibrant';
  const isMinimalPreview = theme.templateId === 'minimal';
  const isBakeryPreview = theme.templateId === 'bakery';
  const isOrganicPreview = theme.templateId === 'organic_market';
  const isCoffeeAtelierPreview = theme.templateId === 'coffee_atelier';
  const isSignatureMarketPreview = theme.templateId === 'matcha_signature';
  const isBotanicalSketchPreview = theme.templateId === 'botanical_sketch';
  const isFluidMonochromePreview = theme.templateId === 'fluid_monochrome';
  const previewCategories = ['Rides', 'Food', 'Quik', 'Pay', 'Hala Taxi', 'Box'];

  const renderPreviewLayout = () => {
    // Vibrant Template Preview
    if (isVibrantPreview) {
      return (
        <div className="h-full w-full bg-gradient-to-b from-white to-orange-50">
          {/* Cover Image */}
          <div className="h-24 bg-gradient-to-r from-orange-500 to-orange-600" />

          <div className="px-3 space-y-4 pt-4 pb-4">
            {/* Store Info Card */}
            <div className="rounded-3xl bg-white shadow-md overflow-hidden border-4 border-orange-100">
              <div className="flex items-start gap-4 p-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-400 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <span className="text-2xl font-black text-orange-600">C</span>
                </div>
                <div className="flex-1 space-y-2">
                  <h1 className="text-lg font-black text-gray-900">{restaurant?.name || 'Coffee Shop'}</h1>
                  <div className="space-y-1 text-xs font-semibold text-gray-700">
                    <p className="flex items-center gap-1.5"><span>📍</span>{restaurant?.address || 'Huế'}</p>
                    <p className="flex items-center gap-1.5"><span>☎️</span>0123456789</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Buttons */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">📋 Our Menu</p>
              <div className="flex gap-2 flex-wrap">
                {['Cà phê', 'Matcha'].map((cat) => (
                  <button key={cat} type="button" className="px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md text-xs">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid gap-3 grid-cols-2">
              {PREVIEW_PRODUCTS.map((product) => (
                <div key={product.id} className="rounded-2xl bg-white border-2 border-orange-200 shadow-md overflow-hidden">
                  <div className="h-20 bg-orange-50" />
                  <div className="p-3 space-y-1.5">
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{product.name}</h4>
                    <p className="text-xs text-orange-600 font-black">
                      {new Intl.NumberFormat(theme.currency === 'VND' ? 'vi-VN' : theme.currency === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency: theme.currency, maximumFractionDigits: theme.currency === 'VND' ? 0 : 2 }).format(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Minimal Template Preview - CHECK BEFORE CLASSIC!
    if (isMinimalPreview) {
      return (
        <div className="h-full w-full flex flex-col bg-white">
          {/* Cover Banner */}
          <div className="h-20 bg-gradient-to-r from-indigo-400 via-indigo-300 to-slate-400" />

          {/* Header */}
          <div className="px-4 py-4 border-b border-slate-200 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-indigo-200 flex items-center justify-center font-black text-indigo-700">
                C
              </div>
              <div>
                <h1 className="text-base font-black text-gray-900">{restaurant?.name || 'Store'}</h1>
                <p className="text-xs text-slate-600 font-medium">Quán cf thời thượng</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 font-medium space-y-0.5">
              <p>📍 Huế</p>
              <p>☎️ 0123456789</p>
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 py-3 border-b border-slate-200 space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-700">Danh Mục</p>
            <div className="flex gap-2">
              <button className="rounded-full bg-indigo-600 text-white font-bold px-4 py-1 text-xs shadow-sm">Cà phê</button>
              <button className="rounded-full bg-slate-200 text-slate-700 font-bold px-4 py-1 text-xs">Matcha</button>
            </div>
          </div>

          {/* Products */}
          <div className="px-4 py-3 space-y-4 overflow-y-auto flex-1">
            {/* Product Card 1 */}
            <div className="flex gap-4 pb-4 border-b border-slate-100">
              <div className="w-28 h-28 rounded-lg bg-slate-300 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="font-black text-sm text-gray-900">Coldbrew</h3>
                <p className="text-xs text-slate-600">Cà phê Arabica được ủ lạnh trong 8h</p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-indigo-600 font-bold">#coffee</span>
                  <span className="text-xs text-indigo-600 font-bold">#coldbrew</span>
                  <span className="text-xs text-indigo-600 font-bold">#ice</span>
                </div>

                {/* Variants */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">M +0đ</span>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">L +13,000đ</span>
                </div>

                {/* Price Range */}
                <p className="text-sm font-black text-indigo-600">Từ 32.000đ - 45.000đ</p>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="flex gap-4">
              <div className="w-28 h-28 rounded-lg bg-slate-300 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="font-black text-sm text-gray-900">Americano</h3>
                <p className="text-xs text-slate-600">Khác với cà phê Việt Nam, cà phê kiểu Mỹ...</p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-indigo-600 font-bold">#cà phê</span>
                </div>

                {/* Variants */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">M +0đ</span>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">L +5,000đ</span>
                </div>

                {/* Price Range */}
                <p className="text-sm font-black text-indigo-600">Từ 25.000đ - 30.000đ</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Botanical Sketchbook Template Preview
    if (isBotanicalSketchPreview) {
      return (
        <div className="h-full w-full bg-[#f4efe0] text-[#4d453b]">
          <div className="space-y-4 px-3 pb-4 pt-4">
            <div className="rounded-[28px] border border-[#d6c8a6] bg-[#f7f0df] p-4 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="h-14 w-14 flex-shrink-0 rounded-[20px] border border-[#c2b49a] bg-[#e5ddc5]" />
                <div className="min-w-0 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#81755f]">La Petite Collection</p>
                  <h1 className="truncate text-lg font-bold text-[#3f382f]">{restaurant?.name || 'Coffee Shop'}</h1>
                  <p className="text-sm text-[#6d6457]">{restaurant?.bio || 'Quán coffee tọa lạc tại thành phố Huế.'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[#6d6457]">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#cbc1a8] bg-white px-2.5 py-1">📍 {restaurant?.address || 'Huế'}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#cbc1a8] bg-white px-2.5 py-1">☎️ 0123456789</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#d6c8a6] bg-[#f7f0df] p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#81755f]">Danh mục</p>
              <h2 className="mt-2 text-lg font-bold text-[#3f382f]">Chọn món bạn muốn thử</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-full border border-[#8f8771] bg-[#8f8771] px-3 py-1.5 text-xs font-semibold text-white">Cà phê</button>
                <button className="rounded-full border border-[#cac1a4] bg-[#fff9ed] px-3 py-1.5 text-xs font-semibold text-[#6d6457]">Matcha</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PREVIEW_PRODUCTS.slice(0, 2).map((product, idx) => {
                const minPrice = product.price;
                const maxPrice = product.price + (idx + 1) * 9000;

                return (
                  <div key={product.id} className="overflow-hidden rounded-[26px] border border-[#d6c8a6] bg-white p-4 shadow-sm">
                    <div className="mb-4 h-32 overflow-hidden rounded-[22px] bg-[#ddd3ba]">
                      {restaurant?.coverUrl ? (
                        <img
                          src={restaurant.coverUrl}
                          alt="Product"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-[#3f382f]">{product.name}</h4>
                      <p className="text-sm leading-relaxed text-[#6d6457]">{product.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#d2c8a8] bg-[#f5f0df] px-2 py-1 text-[10px] font-semibold text-[#736852]">#coffee</span>
                        <span className="rounded-full border border-[#d2c8a8] bg-[#f5f0df] px-2 py-1 text-[10px] font-semibold text-[#736852]">#coldbrew</span>
                        <span className="rounded-full border border-[#d2c8a8] bg-[#f5f0df] px-2 py-1 text-[10px] font-semibold text-[#736852]">#ice</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-base font-bold text-[#3f382f]">Từ {new Intl.NumberFormat('vi-VN').format(minPrice)} đ - {new Intl.NumberFormat('vi-VN').format(maxPrice)} đ</p>
                        <button className="rounded-full border border-[#8f8771] bg-[#8f8771] px-3 py-1.5 text-[11px] font-semibold text-white">Chi tiết</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Fluid Monochrome Template Preview
    if (isFluidMonochromePreview) {
      return (
        <div className="h-full w-full bg-[#f8f7f5] text-[#1a1a1a]">
          <div className="h-24 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#4f4f4f] via-[#666] to-[#4a4a4a]">
            {restaurant?.coverUrl ? (
              <img
                src={restaurant.coverUrl}
                alt="Cover"
                className="h-full w-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
            ) : null}
          </div>

          <div className="space-y-4 px-3 pb-4 pt-4">
            <div className="rounded-[26px] border border-[#d8d4cc] bg-[#fbfaf8] p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 flex-shrink-0 rounded-[36px] border border-[#bdb8ad] bg-[#e5e2dc]" />
                <div className="min-w-0 space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#777268]">✧ Welcome</p>
                  <h1 className="truncate text-xl font-black text-[#1f1f1f]">{restaurant?.name || 'Coffee Shop'}</h1>
                  <div className="space-y-0.5 text-[11px] font-semibold text-[#5e5b55]">
                    <p>📍 {restaurant?.address || 'Huế'}</p>
                    <p>☎️ 0123456789</p>
                  </div>
                  <p className="text-[11px] text-[#6c6961]">{restaurant?.bio || 'Quán coffee tọa lạc tại thành phố Huế.'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-[#ded9cf] bg-white p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#747068]">◆ Danh mục</p>
              <h2 className="mt-1 text-xl font-black text-[#1e1e1e]">Chọn món bạn muốn thử</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-full border border-[#1f1f1f] bg-[#1f1f1f] px-3 py-1.5 text-xs font-black text-[#f8f7f5]">Cà phê</button>
                <button className="rounded-full border border-[#c9c3b8] bg-[#f7f5f1] px-3 py-1.5 text-xs font-black text-[#5f5b54]">Matcha</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PREVIEW_PRODUCTS.slice(0, 2).map((product, idx) => {
                const minPrice = product.price;
                const maxPrice = product.price + (idx + 1) * 9000;

                return (
                  <div key={product.id} className="overflow-hidden rounded-[26px] border border-[#e0dbd1] bg-white p-4 shadow-sm">
                    <div className="grid gap-3 sm:grid-cols-[90px_1fr]">
                      <div className="h-24 w-full overflow-hidden rounded-[24px] border border-[#ccc7bd] bg-[#e6e2d9]" />
                      <div className="min-w-0 space-y-2">
                        <h4 className="truncate text-base font-black text-[#1f1f1f]">{product.name}</h4>
                        <p className="line-clamp-2 text-[11px] font-medium text-[#605d56]">{product.description}</p>
                        <div className="mt-3 flex items-center justify-between gap-1">
                          <p className="text-[9px] font-black text-[#1f1f1f]">Từ {new Intl.NumberFormat('vi-VN').format(minPrice)} đ - {new Intl.NumberFormat('vi-VN').format(maxPrice)} đ</p>
                          <button className="rounded-full border border-[#1f1f1f] bg-[#1f1f1f] px-3 py-1 text-[5px] font-black text-[#f8f7f5]">Chi tiết</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#efebe4] px-2 py-0.5 text-[9px] font-black text-[#666259]">#coffee</span>
                          <span className="rounded-full bg-[#efebe4] px-2 py-0.5 text-[9px] font-black text-[#666259]">#coldbrew</span>
                          <span className="rounded-full bg-[#efebe4] px-2 py-0.5 text-[9px] font-black text-[#666259]">#ice</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Signature Market Template Preview
    if (isSignatureMarketPreview) {
      return (
        <div className="h-full w-full bg-[#f8f3e9] text-[#2c2017]">
          <div className="relative h-24 overflow-hidden rounded-b-[20px] border-b border-[#d8c7b0] bg-[radial-gradient(circle_at_top_left,_#7f5a40_0%,_#573a28_56%,_#2f1f16_100%)]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#2e1f15]/34 via-[#2e1f15]/52 to-[#2e1f15]/66" />
            <div className="absolute inset-x-0 top-2 flex items-center justify-between px-3">
              <p className="inline-flex rounded-full border border-[#f4d8c0]/75 bg-[#fff3e7]/15 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#fff4ea]">
                Signature Market
              </p>
              <p className="inline-flex rounded-full border border-[#f4d8c0]/75 bg-[#fff3e7]/15 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#fff4ea]">
                Seasonal Edit
              </p>
            </div>
          </div>

          <div className="-mt-1 px-3">
            <div className="rounded-[20px] border border-[#d8c7b0] bg-[#fffaf3]/95 p-3 shadow-[0_10px_20px_-14px_rgba(78,49,29,0.5)]">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-xl border border-[#e6d8c6] bg-[#ece2d4]" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#a66139]">Fresh Batch Daily</p>
                  <h1 className="truncate text-lg font-black text-[#2d2016]">{restaurant?.name || 'Coffee Shop'}</h1>
                  <div className="flex flex-wrap gap-1 text-[11px] font-semibold text-[#5d4a3b]">
                    <p className="rounded-full bg-[#f4ebdc] px-2 py-0.5">📍 {restaurant?.address || 'Huế'}</p>
                    <p className="rounded-full bg-[#f4ebdc] px-2 py-0.5">☎️ 0123456789</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-3 pb-4 pt-4">
            <div className="rounded-[20px] border border-[#d8c7b0] bg-[#fff8ee] p-3 shadow-[0_10px_20px_-14px_rgba(78,49,29,0.32)]">
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#a66139]">Danh Mục</p>
                  <h2 className="mt-1 text-base font-black text-[#2d2016]">Chọn sản phẩm bạn muốn thử</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full border border-[#a15f38] bg-[#a15f38] px-3 py-1.5 text-xs font-black text-white">Nổi bật</button>
                  <button className="rounded-full border border-[#d6c4ac] bg-[#fffdf9] px-3 py-1.5 text-xs font-black text-[#5d4838]">Món mới</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PREVIEW_PRODUCTS.slice(0, 2).map((product, idx) => {
                const minPrice = product.price;
                const maxPrice = product.price + (idx + 1) * 9000;

                return (
                  <div key={product.id} className="rounded-[18px] border border-[#d8c7b3] bg-[#fffbf4] p-2.5 shadow-[0_10px_20px_-14px_rgba(74,48,30,0.35)] space-y-2.5">
                    <div className="h-28 w-full rounded-2xl bg-[#ddcfbb]" />
                    <div className="px-1 space-y-1.5">
                      <h4 className="truncate text-sm font-black text-[#2d2016]">{product.name}</h4>
                      <p className="line-clamp-2 text-[11px] font-medium text-[#615040]">{product.description}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded-full bg-[#f4ebdc] px-1.5 py-0.5 text-[9px] font-black text-[#825337]">#signature</span>
                        <span className="rounded-full bg-[#f4ebdc] px-1.5 py-0.5 text-[9px] font-black text-[#825337]">#bestseller</span>
                        <span className="rounded-full bg-[#f4ebdc] px-1.5 py-0.5 text-[9px] font-black text-[#825337]">#new</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <p className="text-sm font-black text-[#9a5936]">
                          Từ {new Intl.NumberFormat('vi-VN').format(minPrice)}đ - {new Intl.NumberFormat('vi-VN').format(maxPrice)}đ
                        </p>
                        <button className="rounded-full border border-[#a15f38] bg-[#a15f38] px-2 py-1 text-[9px] font-black uppercase text-white">Chi tiết</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Coffee Atelier Template Preview
    if (isCoffeeAtelierPreview) {
      return (
        <div className="h-full w-full bg-[#ece7df] text-[#1b150f]">
          <div className="relative h-24 overflow-hidden border-b-2 border-[#22190f] bg-[radial-gradient(circle_at_top_left,_#b17f59_0%,_#74472c_56%,_#2d1d12_100%)]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#2b1a10]/20 to-[#2b1a10]/74" />
            <div className="absolute inset-x-0 top-2 flex items-center justify-between px-3 text-[9px] font-black uppercase tracking-[0.14em] text-[#f5e2cf]">
              <span>Coffee Atelier</span>
              <span>Issue 01</span>
            </div>
            <div className="absolute inset-x-0 bottom-2 grid grid-cols-[1fr_auto] items-end gap-2 px-3 text-[#fff4e8]">
              <p className="text-sm font-black uppercase tracking-[0.08em]">Order Coffee</p>
              <p className="border-l border-[#f2c69f] pl-2 text-[9px] font-semibold italic">Editorial</p>
            </div>
          </div>

          <div className="space-y-4 px-3 pb-4 pt-4">
            <div className="border-2 border-[#1f150d] bg-[#f7f2e9] p-3 shadow-[6px_6px_0_0_rgba(31,21,13,0.2)]">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 border-2 border-[#1f150d] bg-[#eadccc]" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#9c6540]">Fresh Batch Daily</p>
                  <h1 className="truncate text-lg font-black text-[#1f150d]">{restaurant?.name || 'Coffee Shop'}</h1>
                  <div className="space-y-0.5 text-[11px] font-semibold text-[#5f3f2b]">
                    <p>📍 {restaurant?.address || 'Huế'}</p>
                    <p>☎️ 0123456789</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-[#21180f] bg-[#1d1711] p-3 shadow-[6px_6px_0_0_rgba(31,21,13,0.2)]">
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#f0bc8f]">Danh Mục</p>
                  <h2 className="mt-1 text-base font-black text-white">Chọn sản phẩm bạn muốn thử</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="border border-[#c7773d] bg-[#c7773d] px-3 py-1.5 text-xs font-black text-[#1f130b]">Cà phê</button>
                  <button className="border border-[#58473a] bg-[#241b14] px-3 py-1.5 text-xs font-black text-[#f8e9da]">Matcha</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {PREVIEW_PRODUCTS.slice(0, 2).map((product, idx) => {
                const minPrice = product.price;
                const maxPrice = product.price + (idx + 1) * 9000;

                return (
                  <div
                    key={product.id}
                    className="border-2 border-[#21170f] bg-[#fffaf3] shadow-[5px_5px_0_0_rgba(33,23,15,0.16)] overflow-hidden"
                  >
                    <div className="h-24 w-full bg-[#ecdcc9]" />
                    <div className="space-y-1.5 p-2.5">
                      <h4 className="truncate text-xs font-black text-[#25190f]">{product.name}</h4>
                      <p className="line-clamp-2 text-[10px] font-medium text-[#674b37]">{product.description}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="border border-[#e2d0bc] bg-[#f5ebdd] px-2 py-0.5 text-[9px] font-black text-[#825233]">#coffee</span>
                        <span className="border border-[#e2d0bc] bg-[#f5ebdd] px-2 py-0.5 text-[9px] font-black text-[#825233]">#coldbrew</span>
                      </div>
                      <div className="flex flex-col items-start justify-between gap-2 pt-1">
                        <p className="text-[11px] font-black text-[#9e5e35]">Từ {new Intl.NumberFormat('vi-VN').format(minPrice)}đ - {new Intl.NumberFormat('vi-VN').format(maxPrice)}đ</p>
                        <button className="border border-[#271c12] bg-[#271c12] px-2 py-1 text-[9px] font-black text-[#f5e6d4]">Chi tiết</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Bakery Template Preview
    if (isBakeryPreview) {
      return (
        <div className="h-full w-full bg-[#f2eadf] text-[#2d1c16]">
          <div className="px-3 pb-3 pt-4">
            <div className="overflow-hidden rounded-[30px] border border-[#ead8c3] bg-[#fff7ee] p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#dfc5ac]" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9f6840]">Fresh Batch Daily</p>
                    <h1 className="truncate text-base font-black text-[#2d1c16]">{restaurant?.name || 'Bakery House'}</h1>
                  </div>
                </div>
                <div className="space-y-0.5 text-[10px] font-semibold text-[#74503b]">
                  <p>📍 {restaurant?.address || 'Huế'}</p>
                  <p>☎️ 0123456789</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[28px] border border-[#e6d2bf] bg-[#fff6eb] p-4 shadow-sm">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9c5a30]">Danh Mục</p>
                <h2 className="mt-2 text-base font-black text-[#2d1c16]">Chọn món bạn muốn thử</h2>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-full bg-[#8f4f2d] px-4 py-2 text-xs font-black text-white">Cà phê</button>
                <button className="rounded-full border border-[#dcc5af] bg-white px-4 py-2 text-xs font-black text-[#744a33]">Matcha</button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[PREVIEW_PRODUCTS[0], PREVIEW_PRODUCTS[1]].map((product) => (
                <div key={product.id} className="rounded-[28px] border border-[#e2d0bc] bg-[#fff9f2] p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 flex-shrink-0 rounded-[22px] bg-[#dcc4ad]" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <h4 className="truncate text-sm font-black text-[#2f1f17]">{product.name}</h4>
                      <p className="line-clamp-2 text-[11px] text-[#705340]">{product.description}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded-full bg-[#f0dfce] px-2 py-1 text-[10px] font-bold text-[#7f5135]">#coffee</span>
                        <span className="rounded-full bg-[#f0dfce] px-2 py-1 text-[10px] font-bold text-[#7f5135]">#hot</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-[#8f4f2d]">
                          {new Intl.NumberFormat(
                            theme.currency === 'VND' ? 'vi-VN' : theme.currency === 'EUR' ? 'de-DE' : 'en-US',
                            { style: 'currency', currency: theme.currency, maximumFractionDigits: theme.currency === 'VND' ? 0 : 2 },
                          ).format(product.price)}
                        </p>
                        <button className="rounded-full border border-[#d4b69d] bg-white px-3 py-1 text-[10px] font-black text-[#774a31]">Chi tiết</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Organic Market Template Preview
    if (isOrganicPreview) {
      return (
        <div className="h-full w-full bg-[#edf1df] text-[#1f2a14]">
          <div className="h-24 border-b border-[#d2dcb9] bg-[radial-gradient(circle_at_top_left,_#b5c676_0%,_#7b9140_62%,_#566928_100%)]" />

          <div className="px-3 pb-4 pt-4 space-y-4">
            <div className="border border-[#c4cf9f] bg-[#f8faee] p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 border-2 border-[#90a353] bg-[#d6dfae]" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#7a8b40]">Organic Daily Picks</p>
                  <h1 className="truncate text-lg font-black text-[#1f2b14]">{restaurant?.name || 'Coffee Shop'}</h1>
                  <div className="space-y-0.5 text-[11px] font-semibold text-[#53622d]">
                    <p>📍 {restaurant?.address || 'Huế'}</p>
                    <p>☎️ 0123456789</p>
                  </div>
                </div>
                <span className="border border-[#d4ddba] bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#5f712e]">Fresh</span>
              </div>
            </div>

            <div className="border border-[#c4cf9f] bg-white p-3 shadow-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#738739]">Danh Mục</p>
                  <h2 className="mt-1 text-base font-black text-[#1f2b14]">Chọn hương vị bạn muốn thử</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="border-2 border-[#6a7f34] bg-[#6a7f34] px-3 py-1.5 text-xs font-black text-white">Cà phê</button>
                  <button className="border border-[#ccd6a9] bg-[#f9fbed] px-3 py-1.5 text-xs font-black text-[#53622d]">Matcha</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PREVIEW_PRODUCTS.slice(0, 2).map((product, idx) => {
                const minPrice = product.price;
                const maxPrice = product.price + (idx + 1) * 9000;

                return (
                  <div key={product.id} className="border border-[#cfd8ae] bg-[#fcfdf7] shadow-sm overflow-hidden">
                    <div className="h-32 w-full border-b border-[#d4ddb8] bg-[#dce5a9]" />
                    <div className="p-3 space-y-1.5">
                      <span className="inline-flex border border-[#d9e2bd] bg-white px-2 py-0.5 text-[9px] font-black uppercase text-[#70823a]">Organic</span>
                      <h4 className="truncate text-sm font-black text-[#1f2b14]">{product.name}</h4>
                      <p className="line-clamp-2 text-[11px] font-semibold text-[#5a6a32]">{product.description}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="border border-[#d6dfba] bg-[#f2f6e2] px-1.5 py-0.5 text-[9px] font-black text-[#6a7d35]">#coffee</span>
                        <span className="border border-[#d6dfba] bg-[#f2f6e2] px-1.5 py-0.5 text-[9px] font-black text-[#6a7d35]">#coldbrew</span>
                        <span className="border border-[#d6dfba] bg-[#f2f6e2] px-1.5 py-0.5 text-[9px] font-black text-[#6a7d35]">#ice</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <p className="text-sm font-black text-[#6a7f34]">
                          Từ {new Intl.NumberFormat('vi-VN').format(minPrice)}đ - {new Intl.NumberFormat('vi-VN').format(maxPrice)}đ
                        </p>
                        <button className="border-b-2 border-[#6a7f34] pb-0.5 text-[10px] font-black uppercase text-[#4e5f26]">Chi tiết</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Classic Template Preview - DEFAULT FOR NON-SPECIAL TEMPLATES
    if (!isModernGridPreview) {
      return (
        <div className="h-full w-full px-4 py-5">
          <div className="mb-4 rounded-[28px] bg-white p-4 shadow-sm" style={{ borderColor: `${theme.primaryColor}16`, borderWidth: 1, borderStyle: 'solid' }}>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">MenuQRGenerate</p>
            <h1 className="mt-3 text-xl font-bold" style={{ color: 'var(--theme-text)' }}>{restaurant?.name || 'Coffee Shop'}</h1>
            <p className="mt-2 text-sm text-gray-500">{restaurant?.bio || 'Quán cf thời thượng'}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm">Cà phê</span>
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-gray-500 shadow-sm">Matcha</span>
          </div>

          <div className={productGridClass}>
            {PREVIEW_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-[24px] border bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
                style={{ ...previewCardStyle, borderColor: `${theme.primaryColor}16`, borderRadius: theme.borderRadius }}
              >
                {theme.showProductImages && (
                  <div className="mb-4 h-28 w-full overflow-hidden rounded-[20px] bg-gray-100">
                    <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
                  </div>
                )}
                <div className="min-w-0 space-y-2">
                  <h4 className="font-semibold text-gray-900 line-clamp-2 break-words">{product.name}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-bold text-white" style={{ backgroundColor: theme.primaryColor }}>
                    {new Intl.NumberFormat(theme.currency === 'VND' ? 'vi-VN' : theme.currency === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency: theme.currency, maximumFractionDigits: theme.currency === 'VND' ? 0 : 2 }).format(product.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ModernGrid Template Preview - UPDATED
    return (
      <div className="h-full w-full bg-[#f7fafc] text-gray-900 overflow-hidden">
        {/* Cover Image */}
        <div className="h-28 bg-gradient-to-br from-emerald-600 to-emerald-700" />

        <div className="relative px-3 pt-4 pb-4 space-y-5">
          {/* Store Header */}
          <div className="rounded-[24px] bg-gradient-to-br from-white via-white to-emerald-50/30 p-5 shadow-lg border border-emerald-100/50 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-28 -right-28 w-56 h-56 bg-emerald-100 rounded-full blur-3xl opacity-20" /></div>
            <div className="relative flex gap-3 items-center">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-200 to-emerald-100 blur-lg opacity-70" />
                <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-emerald-300 bg-white shadow-md">
                  <div className="flex h-full w-full items-center justify-center text-lg font-black text-emerald-600">C</div>
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-emerald-600 font-bold">✨ Welcome to</p>
                  <h1 className="text-lg font-black text-gray-900">{restaurant?.name || 'Coffee Shop'}</h1>
                </div>
                <div className="text-xs text-gray-700 font-semibold space-y-0.5">
                  <div className="flex items-center gap-1.5"><span>📍</span>{restaurant?.address || 'Huế'}</div>
                  <div className="flex items-center gap-1.5"><span>☎️</span>0123456789</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bold Category Section */}
          <div className="rounded-[20px] bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 shadow-lg text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-10"><div className="absolute -top-14 -right-14 w-40 h-40 bg-white rounded-full blur-2xl" /></div>
            <div className="relative space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] font-bold text-emerald-100">📋 Menu Categories</p>
                <h2 className="text-base font-black text-white mt-1">What are you craving?</h2>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['Cà phê', 'Matcha'].map((cat) => (
                  <button key={cat} type="button" className="rounded-full bg-white/20 backdrop-blur-sm text-white font-bold py-1.5 px-3 text-xs transition-all border border-white/30 hover:bg-white/30">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid gap-3 grid-cols-2">
            {PREVIEW_PRODUCTS.map((product) => (
              <div key={product.id} className="rounded-[20px] border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="h-20 bg-gray-100" />
                <div className="p-3 space-y-1.5">
                  <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{product.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                  <p className="text-xs font-bold text-emerald-600">
                    {new Intl.NumberFormat(theme.currency === 'VND' ? 'vi-VN' : theme.currency === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency: theme.currency, maximumFractionDigits: theme.currency === 'VND' ? 0 : 2 }).format(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const sampleMenuUrl = restaurant ? `/m/${restaurant.slug}` : '/m/preview';

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id), {
        layoutType: theme.layoutType,
        showProductImages: theme.showProductImages,
        primaryColor: theme.primaryColor,
        bgColor: theme.bgColor,
        textColor: theme.textColor,
        fontFamily: theme.fontFamily,
        borderRadius: theme.borderRadius,
        qrDotColor: theme.qrDotColor,
        qrBgColor: theme.qrBgColor,
        currency: theme.currency,
        templateId: theme.templateId,
        updatedAt: new Date().toISOString(),
      });
      setMessage({ type: 'success', text: 'Đã lưu tùy chỉnh giao diện thành công.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Không thể lưu giao diện. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  const resetTheme = () => {
    updateTheme(initialThemeState);
    setMessage({ type: 'success', text: 'Đã đặt lại giao diện về giá trị hiện tại của cửa hàng.' });
  };

  const activeTemplateOption = TEMPLATE_OPTIONS.find((option) => option.id === theme.templateId) || TEMPLATE_OPTIONS[0];
  const activeTemplateOrder = TEMPLATE_OPTIONS.findIndex((option) => option.id === activeTemplateOption.id) + 1;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.42fr_0.58fr] xl:items-stretch xl:min-h-[620px]">
      <div className="space-y-6 xl:flex xl:h-full xl:min-h-[620px] xl:flex-col">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Giao diện Menu</h2>
              <p className="text-sm text-gray-500 mt-1">Tùy chỉnh màu, font, bố cục và QR trong một màn hình.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:shrink-0">
              <button
                type="button"
                onClick={resetTheme}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCcw size={16} /> Đặt lại
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!restaurant || saving}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition disabled:opacity-50"
              >
                <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
          {message && (
            <div className={`mt-6 rounded-2xl px-4 py-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{message.text}</span>
              </div>
            </div>
          )}
        </div>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 xl:flex-1 xl:min-h-[620px]">
          <div className="flex items-center justify-between gap-3 text-gray-900">
            <div className="flex items-center gap-3">
              <Palette size={20} />
              <div>
                <h3 className="text-lg font-semibold">Template</h3>
                <p className="text-sm text-gray-500">Chọn layout menu hiện tại.</p>
              </div>
            </div>
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{TEMPLATE_OPTIONS.length} mẫu</span>
          </div>

          <div className="mt-4 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700">Đang chọn</p>
                <h4 className="mt-1 text-base font-bold text-gray-900">{activeTemplateOption.name}</h4>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{activeTemplateOption.description}</p>
              </div>
              <span className="inline-flex h-8 shrink-0 items-center rounded-full bg-white px-3 text-xs font-bold text-orange-700">
                {activeTemplateOrder}/{TEMPLATE_OPTIONS.length}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="inline-flex items-center rounded-full border border-orange-200 bg-white px-2.5 py-1 text-orange-700">{activeTemplateOption.vibe}</span>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-gray-600">{activeTemplateOption.bestFor}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl bg-slate-50/70 p-3 sm:grid-cols-2 xl:max-h-[440px] xl:overflow-y-auto xl:pr-2 xl:[scrollbar-gutter:stable]">
            {TEMPLATE_OPTIONS.map((option, optionIndex) => {
              const isSelected = theme.templateId === option.id;
              const optionOrder = optionIndex + 1;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateTheme({ templateId: option.id })}
                  aria-pressed={isSelected}
                  className={`group relative overflow-hidden rounded-[30px] border bg-white p-5 text-left shadow-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 ${isSelected ? 'border-orange-400 bg-orange-50 shadow-md' : 'border-gray-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md'}`}
                >
                  <div className="flex h-full flex-col gap-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{option.name}</div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">{option.description}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 text-[11px] font-semibold text-gray-500">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">{optionOrder < 10 ? `0${optionOrder}` : optionOrder}</span>
                      <span className={isSelected ? 'text-orange-700' : 'text-gray-400'}>{isSelected ? 'Đang áp dụng' : 'Chọn mẫu'}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

      </div>

      <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-[36px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm xl:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Xem trước</p>
              <h3 className="text-xl font-bold text-gray-900">Phone mockup</h3>
              <p className="mt-1 text-xs text-slate-500">Mô phỏng realtime theo template đang chọn</p>
            </div>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live preview</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              {activeTemplateOption.name}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Font: {theme.fontFamily}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Tiền tệ: {theme.currency}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-center">
            <div className="relative mx-auto w-full max-w-[396px]">
              <span className="pointer-events-none absolute -left-[3px] top-20 h-10 w-[3px] rounded-r bg-slate-500/70" />
              <span className="pointer-events-none absolute -right-[3px] top-24 h-14 w-[3px] rounded-l bg-slate-500/80" />
              <span className="pointer-events-none absolute -right-[3px] top-44 h-11 w-[3px] rounded-l bg-slate-500/80" />

              <div className="relative rounded-[44px] border-[10px] border-slate-900 bg-slate-900 p-2 shadow-[0_26px_60px_-34px_rgba(15,23,42,0.9)]">
                <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-5 w-36 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

                <div className="overflow-hidden rounded-[30px] border border-slate-200 text-sm" style={previewRootStyle}>
                  <div className="no-scrollbar h-[clamp(460px,64vh,620px)] overflow-x-hidden overflow-y-auto overscroll-contain [&_button]:whitespace-nowrap [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:max-w-full [&_img]:object-cover">
                    <div className="min-h-full">{renderPreviewLayout()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
