import { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Store } from '../../types';
import * as QRCode from 'qrcode.react';
import { CheckCircle, LayoutGrid, LayoutList, Palette, QrCode, RefreshCcw, Save } from 'lucide-react';

const TEMPLATE_OPTIONS = [
  { id: 'classic', name: 'Classic', description: 'Layout danh sách truyền thống.' },
  { id: 'modern_grid', name: 'Modern Grid', description: 'Grid cards, icon categories và banner hiện đại.' },
  { id: 'vibrant', name: 'Vibrant', description: 'Thiết kế sống động với cam sôi động.' },
  { id: 'minimal', name: 'Minimal', description: 'Thiết kế tối giản, sạch sẽ và chuyên nghiệp.' },
  { id: 'bakery', name: 'Bakery', description: 'Editorial ấm áp, ảnh lớn, phù hợp quán bánh và cà phê.' },
  { id: 'organic_market', name: 'Organic Market', description: 'Phong cách panel organic góc cạnh, khác biệt rõ với Bakery.' },
  { id: 'coffee_atelier', name: 'Coffee Atelier', description: 'Hero typography, tông cà phê cao cấp và modal sản phẩm đậm chất studio.' },
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
  const [organicPreviewCardMode, setOrganicPreviewCardMode] = useState<'showcase' | 'compact'>('showcase');
  const [coffeeAtelierPreviewMode, setCoffeeAtelierPreviewMode] = useState<'gallery' | 'compact'>('gallery');

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
    minHeight: '720px',
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
  const previewCategories = ['Rides', 'Food', 'Quik', 'Pay', 'Hala Taxi', 'Box'];

  const renderPreviewLayout = () => {
    // Vibrant Template Preview
    if (isVibrantPreview) {
      return (
        <div className="bg-gradient-to-b from-white to-orange-50 min-h-full">
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
        <div className="bg-white flex flex-col min-h-[600px]">
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

    // Coffee Atelier Template Preview
    if (isCoffeeAtelierPreview) {
      return (
        <div className="min-h-[640px] bg-[#ece7df] text-[#1b150f]">
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

                <div className="inline-flex border border-[#3f3328] bg-[#2b2118] p-0.5">
                  {[
                    { id: 'gallery', label: 'Thẻ lớn' },
                    { id: 'compact', label: 'Thẻ gọn' },
                  ].map((mode) => {
                    const active = coffeeAtelierPreviewMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setCoffeeAtelierPreviewMode(mode.id as 'gallery' | 'compact')}
                        className={`px-3 py-1 text-[10px] font-black transition ${active ? 'bg-[#c7773d] text-[#1f130b]' : 'text-[#f2dbc7]'}`}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="border border-[#c7773d] bg-[#c7773d] px-3 py-1.5 text-xs font-black text-[#1f130b]">Cà phê</button>
                  <button className="border border-[#58473a] bg-[#241b14] px-3 py-1.5 text-xs font-black text-[#f8e9da]">Matcha</button>
                </div>
              </div>
            </div>

            <div className={coffeeAtelierPreviewMode === 'gallery' ? 'grid grid-cols-2 gap-2.5' : 'space-y-3'}>
              {PREVIEW_PRODUCTS.slice(0, 2).map((product, idx) => {
                const minPrice = product.price;
                const maxPrice = product.price + (idx + 1) * 9000;

                return (
                  <div
                    key={product.id}
                    className={`border-2 border-[#21170f] bg-[#fffaf3] shadow-[5px_5px_0_0_rgba(33,23,15,0.16)] ${coffeeAtelierPreviewMode === 'compact' ? 'flex gap-3 p-3' : 'overflow-hidden'}`}
                  >
                    <div className={`${coffeeAtelierPreviewMode === 'compact' ? 'h-20 w-20 flex-shrink-0 border border-[#21170f]' : 'h-24 w-full'} bg-[#ecdcc9]`} />
                    <div className={`${coffeeAtelierPreviewMode === 'compact' ? 'min-w-0 flex-1' : 'space-y-1.5 p-2.5'} space-y-1.5`}>
                      <h4 className="truncate text-xs font-black text-[#25190f]">{product.name}</h4>
                      <p className="line-clamp-2 text-[10px] font-medium text-[#674b37]">{product.description}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="border border-[#e2d0bc] bg-[#f5ebdd] px-2 py-0.5 text-[9px] font-black text-[#825233]">#coffee</span>
                        <span className="border border-[#e2d0bc] bg-[#f5ebdd] px-2 py-0.5 text-[9px] font-black text-[#825233]">#coldbrew</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <p className="text-[11px] font-black text-[#9e5e35]">Từ {new Intl.NumberFormat('vi-VN').format(minPrice)}đ - {new Intl.NumberFormat('vi-VN').format(maxPrice)}đ</p>
                        <button className="border border-[#271c12] bg-[#271c12] px-2 py-1 text-[9px] font-black text-[#f5e6d4]">Chi tiết</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-2 border-[#d8c1a8] bg-[#fff2e3] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8b5a39]">Chi tiết sản phẩm</p>
              <p className="mt-1 text-[11px] font-medium text-[#5f4331]">Ảnh sản phẩm, giá từ đến, mô tả chi tiết, variants.</p>
              <button className="mt-2 w-full border border-[#241910] bg-[#241910] py-2 text-[11px] font-black uppercase text-[#f3e2d0]">Đóng</button>
            </div>
          </div>
        </div>
      );
    }

    // Bakery Template Preview
    if (isBakeryPreview) {
      return (
        <div className="min-h-[620px] bg-[#f2eadf] text-[#2d1c16]">
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9c5a30]">Danh Mục</p>
                  <h2 className="mt-2 text-base font-black text-[#2d1c16]">Chọn món bạn muốn thử</h2>
                </div>
                <div className="inline-flex rounded-full border border-[#e4d0bc] bg-[#f7ebdd] p-0.5">
                  <span className="rounded-full bg-[#8f4f2d] px-3 py-1 text-[10px] font-black text-white">Thẻ lớn</span>
                  <span className="px-3 py-1 text-[10px] font-black text-[#8f6449]">Gọn</span>
                </div>
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
        <div className="min-h-[640px] bg-[#edf1df] text-[#1f2a14]">
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

                <div className="inline-flex border border-[#c8d3a3] bg-[#eff3dc] p-0.5">
                  {[
                    { id: 'showcase', label: 'Thẻ lớn' },
                    { id: 'compact', label: 'Gọn' },
                  ].map((view) => {
                    const active = organicPreviewCardMode === view.id;
                    return (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setOrganicPreviewCardMode(view.id as 'showcase' | 'compact')}
                        className={`px-3 py-1 text-[10px] font-black uppercase transition ${active ? 'bg-[#6a7f34] text-white' : 'text-[#607036]'}`}
                      >
                        {view.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="border-2 border-[#6a7f34] bg-[#6a7f34] px-3 py-1.5 text-xs font-black text-white">Cà phê</button>
                  <button className="border border-[#ccd6a9] bg-[#f9fbed] px-3 py-1.5 text-xs font-black text-[#53622d]">Matcha</button>
                </div>
              </div>
            </div>

            <div className={organicPreviewCardMode === 'showcase' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
              {PREVIEW_PRODUCTS.slice(0, 2).map((product, idx) => {
                const minPrice = product.price;
                const maxPrice = product.price + (idx + 1) * 9000;

                return (
                  <div key={product.id} className={`border border-[#cfd8ae] bg-[#fcfdf7] shadow-sm ${organicPreviewCardMode === 'compact' ? 'flex gap-2 p-2.5' : 'overflow-hidden'}`}>
                    <div className={`${organicPreviewCardMode === 'compact' ? 'h-20 w-20 flex-shrink-0' : 'h-32 w-full'} border-b border-[#d4ddb8] bg-[#dce5a9]`} />
                    <div className={`${organicPreviewCardMode === 'compact' ? 'min-w-0 flex-1' : 'p-3'} space-y-1.5`}>
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

            <div className="border border-[#d5ddb8] bg-[#f2f6de] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6f8234]">Chi tiết sản phẩm</p>
              <p className="mt-1 text-[11px] font-semibold text-[#4f6028]">Mô tả - mô tả chi tiết - giá variants...</p>
              <button className="mt-2 w-full border border-[#6a7f34] bg-[#6a7f34] py-2 text-[11px] font-black uppercase text-white">Đóng</button>
            </div>
          </div>
        </div>
      );
    }

    // Classic Template Preview - DEFAULT FOR NON-SPECIAL TEMPLATES
    if (!isModernGridPreview) {
      return (
        <div className="px-4 py-5">
          <div className="mb-4 rounded-[28px] bg-white p-4 shadow-sm" style={{ borderColor: `${theme.primaryColor}16`, borderWidth: 1, borderStyle: 'solid' }}>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">MenuQRGenerate</p>
            <h1 className="mt-3 text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{restaurant?.name || 'Coffee Shop'}</h1>
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
      <div className="bg-[#f7fafc] text-gray-900 overflow-hidden">
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

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.42fr_0.58fr]">
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Giao diện Menu</h2>
              <p className="text-sm text-gray-500 mt-1">Tùy chỉnh màu, font, bố cục và QR trong một màn hình.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetTheme}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCcw size={16} /> Đặt lại
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!restaurant || saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition disabled:opacity-50"
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

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Palette size={20} />
            <div>
              <h3 className="text-lg font-semibold">Template</h3>
              <p className="text-sm text-gray-500">Chọn layout menu hiện tại.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {TEMPLATE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => updateTheme({ templateId: option.id })}
                className={`rounded-3xl border p-4 text-left text-sm transition ${theme.templateId === option.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="font-semibold text-gray-900">{option.name}</div>
                <p className="text-gray-500 mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </section>

      </div>

      <div className="space-y-6">
        <div className="rounded-[40px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Xem trước</p>
                <h3 className="text-xl font-bold text-gray-900">Phone mockup</h3>
              </div>
              <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">Theme tùy chỉnh</span>
            </div>

            <div className="mx-auto w-full max-w-[340px] rounded-[42px] border border-gray-200 bg-slate-100 p-4 shadow-lg">
              <div className="overflow-hidden rounded-[32px] border border-gray-200 shadow-inner" style={previewRootStyle}>
                {renderPreviewLayout()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
