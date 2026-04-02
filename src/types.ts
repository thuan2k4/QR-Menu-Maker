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
  themeColor?: string; // backward compatibility for existing data
}

export type Restaurant = Store; // legacy alias for compatibility

export interface Category {
  id: string;
  name: string;
  order: number;
  storeId: string;
  restaurantId?: string; // legacy compatibility
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
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
