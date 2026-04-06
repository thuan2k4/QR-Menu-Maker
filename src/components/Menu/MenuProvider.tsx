import { ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { auth, db, logEvent } from '../../firebase';
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Store, Category, Product, StoreCurrency, StoreFontFamily, StoreSizePreset } from '../../types';
import { getMenuTemplateById } from '../../constants/menuTemplates';
import { MenuTemplate } from '../../types';

interface SizePresetClasses {
  storeTitle: string;
  productName: string;
  productDescription: string;
  price: string;
  modalTitle: string;
  modalPrice: string;
  modalDescription: string;
  closeButton: string;
}

interface MenuContextValue {
  store: Store | null;
  categories: Category[];
  products: Product[];
  activeCategory: string | null;
  setActiveCategory: (categoryId: string) => void;
  selectedProduct: Product | null;
  selectProduct: (product: Product) => void;
  clearSelectedProduct: () => void;
  loading: boolean;
  menuVisibility: 'public' | 'private';
  isOwner: boolean;
  selectedTemplate: MenuTemplate;
  primaryColor: string;
  secondaryColor: string;
  currency: StoreCurrency;
  sizePreset: StoreSizePreset;
  fontFamily: StoreFontFamily;
  typography: SizePresetClasses;
  bgColor: string;
  textColor: string;
  borderRadius: string;
  effectiveLayout: 'stacked' | 'editorial' | 'split';
  showProductImages: boolean;
  rootStyle: React.CSSProperties;
  filteredProducts: Product[];
  formatCurrency: (value: number) => string;
  getProductDisplayPrice: (prod: Product) => string;
  getProductDetailDescription: (prod: Product) => string;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
}

const FONT_FAMILY_MAP: Record<StoreFontFamily, string> = {
  Inter: 'Inter, Segoe UI, sans-serif',
  Roboto: 'Roboto, Segoe UI, sans-serif',
  'Playfair Display': 'Playfair Display, Georgia, serif',
  'Be Vietnam Pro': 'Be Vietnam Pro, Segoe UI, sans-serif',
};

const SIZE_PRESET_CLASSES: Record<StoreSizePreset, SizePresetClasses> = {
  compact: {
    storeTitle: 'text-xl',
    productName: 'text-sm',
    productDescription: 'text-[11px]',
    price: 'text-base',
    modalTitle: 'text-xl',
    modalPrice: 'text-xl',
    modalDescription: 'text-sm',
    closeButton: 'text-base',
  },
  normal: {
    storeTitle: 'text-2xl',
    productName: 'text-base',
    productDescription: 'text-xs',
    price: 'text-lg',
    modalTitle: 'text-2xl',
    modalPrice: 'text-2xl',
    modalDescription: 'text-base',
    closeButton: 'text-lg',
  },
  large: {
    storeTitle: 'text-3xl',
    productName: 'text-lg',
    productDescription: 'text-sm',
    price: 'text-xl',
    modalTitle: 'text-3xl',
    modalPrice: 'text-3xl',
    modalDescription: 'text-lg',
    closeButton: 'text-xl',
  },
};

interface MenuProviderProps {
  slug: string;
  children: ReactNode;
}

export function MenuProvider({ slug, children }: MenuProviderProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const lastMenuViewKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!slug) return;
    let unsubscribeCategories: (() => void) | null = null;
    let unsubscribeProducts: (() => void) | null = null;

    const fetchStore = async () => {
      const q = query(collection(db, 'restaurants'), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const storeData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Store;
        setStore(storeData);
        const catQuery = query(collection(db, 'categories'), where('restaurantId', '==', storeData.id));
        const prodQuery = query(collection(db, 'products'), where('restaurantId', '==', storeData.id));

        unsubscribeCategories = onSnapshot(catQuery, (catSnap) => {
          const cats = catSnap.docs
            .map((d) => ({ id: d.id, ...d.data() } as Category))
            .sort((a, b) => a.order - b.order);
          setCategories(cats);
        }, (error) => {
          console.error('Failed to subscribe public categories snapshot:', error);
        });

        unsubscribeProducts = onSnapshot(prodQuery, (prodSnap) => {
          setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
        }, (error) => {
          console.error('Failed to subscribe public products snapshot:', error);
        });
      }
      setLoading(false);
    };

    fetchStore();
    return () => {
      unsubscribeCategories?.();
      unsubscribeProducts?.();
    };
  }, [slug]);

  useEffect(() => {
    if (!store || !slug) return;
    const menuVisibility = store.menuVisibility || 'private';
    const isOwner = !!currentUserId && currentUserId === store.ownerId;
    if (menuVisibility !== 'public' || isOwner) return;

    const viewerType = 'public-user';
    const eventKey = `${store.id}:${slug}:${viewerType}`;
    if (lastMenuViewKeyRef.current === eventKey) return;

    lastMenuViewKeyRef.current = eventKey;
    void logEvent('menu_view', {
      storeId: store.id,
      slug: store.slug,
      menuVisibility,
      extra: {
        source: 'public_menu',
        viewerType,
      },
    });
  }, [store, slug, currentUserId]);

  useEffect(() => {
    if (categories.length === 0) return;
    if (!activeCategory || !categories.some((category) => category.id === activeCategory)) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const selectedTemplate = useMemo(() => getMenuTemplateById(store?.templateId), [store?.templateId]);
  const primaryColor = store?.primaryColor || store?.themeColor || selectedTemplate.primaryColor;
  const secondaryColor = store?.secondaryColor || selectedTemplate.secondaryColor;
  const currency = (store?.currency === 'EUR' || store?.currency === 'USD' || store?.currency === 'VND')
    ? store.currency
    : selectedTemplate.currency;
  const sizePreset = (store?.sizePreset === 'large' || store?.sizePreset === 'compact')
    ? store.sizePreset
    : selectedTemplate.sizePreset;
  const typography = SIZE_PRESET_CLASSES[sizePreset];
  const fontFamily = (store?.fontFamily === 'Roboto' || store?.fontFamily === 'Playfair Display' || store?.fontFamily === 'Be Vietnam Pro')
    ? store.fontFamily
    : selectedTemplate.fontFamily;
  const bgColor = store?.bgColor || secondaryColor;
  const textColor = store?.textColor || '#1f2937';
  const borderRadius = store?.borderRadius || '24px';
  const effectiveLayout = store?.layoutType === 'grid' ? 'split' : store?.layoutType === 'list' ? 'stacked' : selectedTemplate.layout;
  const showProductImages = store?.showProductImages === false ? false : true;

  const rootStyle: React.CSSProperties = selectedTemplate.backgroundStyle === 'solid'
    ? { backgroundColor: bgColor, fontFamily: FONT_FAMILY_MAP[fontFamily], color: textColor }
    : selectedTemplate.backgroundStyle === 'duotone'
      ? { backgroundColor: bgColor, backgroundImage: `linear-gradient(180deg, ${bgColor} 0%, #f8f8f8 52%, #ffffff 100%)`, fontFamily: FONT_FAMILY_MAP[fontFamily], color: textColor }
      : selectedTemplate.backgroundStyle === 'paper'
        ? { backgroundColor: bgColor, backgroundImage: `radial-gradient(circle at 0% 0%, #ffffff 0%, ${bgColor} 45%, #fffaf5 100%)`, fontFamily: FONT_FAMILY_MAP[fontFamily], color: textColor }
        : { backgroundColor: bgColor, backgroundImage: `linear-gradient(180deg, ${bgColor} 0%, #ffffff 72%)`, fontFamily: FONT_FAMILY_MAP[fontFamily], color: textColor };

  const formatCurrency = (value: number) => {
    const localeByCurrency: Record<StoreCurrency, string> = {
      EUR: 'de-DE',
      USD: 'en-US',
      VND: 'vi-VN',
    };

    try {
      return new Intl.NumberFormat(localeByCurrency[currency], {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
      }).format(value);
    } catch {
      return `${value.toLocaleString('vi-VN')}đ`;
    }
  };

  const parseProductPrice = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '.');
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : NaN;
    }

    return NaN;
  };

  const getProductDisplayPrice = (prod: Product) => {
    const variants = prod.variants || [];
    const validVariantPrices = variants
      .map((v) => parseProductPrice(v.price))
      .filter((p) => Number.isFinite(p));

    if (validVariantPrices.length > 0) {
      const min = Math.min(...validVariantPrices);
      const max = Math.max(...validVariantPrices);
      if (min === max) {
        return formatCurrency(min);
      }
      return `Từ ${formatCurrency(min)} - ${formatCurrency(max)}`;
    }

    return formatCurrency(parseProductPrice(prod.price) || 0);
  };

  const getProductDetailDescription = (prod: Product) => {
    const longDescription = prod.longDescription?.trim();
    const legacyDescription = prod.description?.trim();
    const shortDescription = prod.shortDescription?.trim();
    return longDescription || legacyDescription || shortDescription || 'Không có mô tả cho sản phẩm này.';
  };

  const filteredProducts = useMemo(() => {
    return activeCategory
      ? products.filter((product) => product.categoryId === activeCategory)
      : [];
  }, [activeCategory, products]);

  const isOwner = !!currentUserId && !!store && currentUserId === store.ownerId;
  const menuVisibility = store?.menuVisibility || 'private';

  const selectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    if (!store) return;
    void logEvent('product_detail_click', {
      storeId: store.id,
      productId: prod.id,
      slug: store.slug,
      menuVisibility,
      extra: {
        source: 'public_menu',
        categoryId: prod.categoryId,
        viewerType: isOwner ? 'owner-preview' : 'public-user',
      },
    });
  };

  const clearSelectedProduct = () => {
    setSelectedProduct(null);
  };

  const value: MenuContextValue = {
    store,
    categories,
    products,
    activeCategory,
    setActiveCategory,
    selectedProduct,
    selectProduct,
    clearSelectedProduct,
    loading,
    menuVisibility: menuVisibility as 'public' | 'private',
    isOwner,
    selectedTemplate,
    primaryColor,
    secondaryColor,
    currency,
    sizePreset,
    typography,
    fontFamily,
    bgColor,
    textColor,
    borderRadius,
    effectiveLayout,
    showProductImages,
    rootStyle,
    filteredProducts,
    formatCurrency,
    getProductDisplayPrice,
    getProductDetailDescription,
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}
