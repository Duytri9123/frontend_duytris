// types/index.ts - Dùng chung cho cả frontend và Admin

// ===== USER =====
export interface User {
  id: number
  name: string
  email: string
  isAdmin: boolean
  email_verified_at: string | null
  created_at: string
}

// ===== PRODUCT =====
export type ProductStatus = 'active' | 'inactive' | 'draft'

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  status: ProductStatus
  brand: Brand | null
  category: Category | null
  images: ProductImage[]
  thumbnail_image: ProductImage | null
  variants: ProductVariant[]
  avg_rating: number
  rating_count: number
  views?: ViewProduct[]
}

export interface ProductVariant {
  id: number
  sku: string
  selling_price: number
  original_price: number
  quantity: number
  weight: number | null
  dimensions: string | null
  is_default: boolean
  attribute_values: AttributeValue[]
  image_indexes: number[]
  images?: ProductImage[]
}

export interface ProductImage {
  id: number
  url: string
  is_thumbnail: boolean
  product_variant_id?: number | null
}

// ===== BRAND & CATEGORY =====
export interface Brand {
  id: number
  name: string
  slug: string
  logo?: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  parent?: Category | null
  children?: Category[]
}

// ===== ATTRIBUTES =====
export interface ProductAttribute {
  id: number
  name: string
  values?: AttributeValue[]
}

export interface AttributeValue {
  id: number
  value: string
  product_attribute: ProductAttribute
}

// ===== CART =====
export interface Cart {
  id: number
  user_id: number
  items: CartItem[]
}

export interface CartItem {
  id: number
  cart_id: number
  product_id: number
  variant: ProductVariant
  quantity: number
  product?: Pick<Product, 'id' | 'name' | 'thumbnail_image'>
}

// Guest cart (localStorage) - tương thích với Vue store cũ
export interface GuestCartItem {
  productId: number
  name: string
  quantity: number
  variant: ProductVariant
}

// ===== ORDER =====
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: number
  user_id: number
  status: OrderStatus
  total_amount: number
  items: OrderItem[]
  address: Address
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  variant_id: number
  quantity: number
  price: number
  product_name: string
  variant_sku?: string
}

// ===== ADDRESS =====
export interface Address {
  id: number
  user_id: number
  full_name: string
  phone: string
  province: string
  district: string
  ward: string
  street: string
  is_default: boolean
}

// ===== REVIEW =====
export interface ProductReview {
  id: number
  product_id: number
  user: Pick<User, 'id' | 'name'>
  rating: number
  comment: string
  created_at: string
}

// ===== VIEW TRACKING =====
export interface ViewProduct {
  id: number
  user_id: number
  product_id: number
  view_count: number
}

// ===== API RESPONSE WRAPPERS =====
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  links?: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

// ===== AI TYPES =====
export interface ProductInfo {
  name: string
  brand?: string
  category?: string
  attributes?: Record<string, string>
  price_range?: { min: number; max: number }
}

export interface RevenueData {
  period: 'week' | 'month' | 'quarter' | 'year'
  orders: Order[]
  total_revenue: number
  order_count: number
}

export interface RevenueAnalysis {
  summary: string
  trends: string[]
  recommendations: string[]
  top_products: string[]
}

export interface PriceSuggestion {
  suggested_price: number
  suggested_category_id: number
  reasoning: string
  confidence: number
}

export interface SearchResult {
  products: Product[]
  extracted_filters: {
    category?: string
    brand?: string
    min_price?: number
    max_price?: number
    attributes?: Record<string, string>
  }
  query_interpretation: string
}

// ===== AUTH =====
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}
