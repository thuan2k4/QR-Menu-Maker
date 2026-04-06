export type StoreFontFamily = 'Inter' | 'Roboto' | 'Playfair Display' | 'Be Vietnam Pro';
export type StoreSizePreset = 'large' | 'normal' | 'compact';
export type StoreCurrency = 'EUR' | 'USD' | 'VND';

export type MenuTemplateLayout = 'stacked' | 'editorial' | 'split';
export type MenuTemplateCardStyle = 'soft' | 'outline' | 'solid';
export type MenuTemplateNavStyle = 'pill' | 'underline' | 'block';
export type MenuTemplateBackgroundStyle = 'soft' | 'paper' | 'duotone' | 'solid';

export interface MenuTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: StoreFontFamily;
  sizePreset: StoreSizePreset;
  currency: StoreCurrency;
  layout: MenuTemplateLayout;
  cardStyle: MenuTemplateCardStyle;
  navStyle: MenuTemplateNavStyle;
  backgroundStyle: MenuTemplateBackgroundStyle;
}

export interface Store {
  id: string;
  name: string;
  bio: string;
  address?: string;
  logoUrl: string;
  coverUrl: string;
  slug: string;
  ownerId: string;
  phone?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: StoreFontFamily;
  sizePreset?: StoreSizePreset;
  currency?: StoreCurrency;
  templateId?: string;
  themeColor?: string; // backward compatibility for existing data
  layoutType?: 'list' | 'grid';
  showProductImages?: boolean;
  qrDotColor?: string;
  qrBgColor?: string;
  bgColor?: string;
  textColor?: string;
  borderRadius?: string;
  menuVisibility?: 'public' | 'private';
}

export type Restaurant = Store; // legacy alias for compatibility

export interface Category {
  id: string;
  name: string;
  order: number;
  storeId: string;
  restaurantId?: string; // legacy compatibility
}

export interface Variant {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  description: string;
  price: number;
  hashtags?: string[];
  variants?: Variant[];
  imageUrl: string;
  categoryId: string;
  storeId: string;
  restaurantId?: string; // legacy compatibility
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
}

export type AnalyticsEventType = 'menu_view' | 'product_detail_click';

export interface AnalyticsEvent {
  id?: string;
  type: AnalyticsEventType;
  storeId: string;
  productId?: string | null;
  slug?: string | null;
  userId?: string | null;
  country?: string | null;
  device?: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  menuVisibility?: 'public' | 'private' | null;
  timestamp?: Date | string | number;
  extra?: Record<string, unknown>;
}

export interface MenuMetrics {
  menuViews: number;
  productDetailClicks: number;
  conversionRate: number;
}
