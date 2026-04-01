export interface Restaurant {
  id: string;
  name: string;
  bio: string;
  logoUrl: string;
  coverUrl: string;
  slug: string;
  ownerId: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  restaurantId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  categoryId: string;
  restaurantId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
}
