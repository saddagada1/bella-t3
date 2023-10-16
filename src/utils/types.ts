import { type OrderItem, type Order as PrismaOrder } from "@prisma/client";

export interface Department {
  id: number;
  name: string;
  categories: { name: string; subcategories: string[]; sizes: string[] }[];
}

export interface Country {
  name: string;
  code: string;
}

export interface Province {
  name: string;
  code: string;
  cities: string[];
  towns: string[];
}

export interface CountryWithProvinces {
  name: string;
  code: string;
  provinces: Province[];
}

export interface Designer {
  id: number;
  name: string;
  slug: string;
}

export interface Condition {
  name: string;
  description: string;
}

export interface Colour {
  name: string;
  code: string;
}

export interface SelectItem {
  value: string;
  label: string;
}

export interface CheckoutReference {
  bagId: string;
  storeId: string;
  sellerId: string;
  userId: string;
  addressId: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
}

export interface SimplifiedProduct {
  id: string;
  images: string[];
  name: string;
  price: number;
}

export interface SimplifiedUser {
  image?: string | null;
  username: string;
  name?: string | null;
}

export interface UserOrder extends PrismaOrder {
  store: {
    user: SimplifiedUser;
  };
  address: Address;
  orderItems: OrderItem[];
}

export interface StoreOrder extends PrismaOrder {
  user: SimplifiedUser;
  address: Address;
  orderItems: OrderItem[];
}

export interface NotificationTemplateArgs {
  NEW_ORDER: Record<string, never>;
  EDIT_ORDER: { orderId: string };
  CANCEL_ORDER: { orderId: string; message: string };
  UPDATE_ORDER: { orderId: string; update: string };
}
