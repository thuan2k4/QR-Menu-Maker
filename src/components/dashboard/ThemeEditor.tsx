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
