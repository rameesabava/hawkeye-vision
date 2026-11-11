function resolveApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) return "https://hawkeye-backend-9e82.onrender.com";

  if (envUrl.includes("||")) {
    const parts = envUrl.split("||").map((s) => s.trim()).filter(Boolean);
    return parts[0] || "https://hawkeye-backend-9e82.onrender.com";
  }

  return envUrl;
}

export const API_BASE_URL = resolveApiBaseUrl();

const isTunnel = typeof API_BASE_URL === "string" && API_BASE_URL.includes("loca.lt");
const TUNNEL_HEADER: Record<string, string> = isTunnel ? { "Bypass-Tunnel-Reminder": "true" } : {};

export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return "/products/recorders.jpg";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imagePath}`;
  }
  if (imagePath.startsWith("uploads/")) {
    return `${API_BASE_URL}/${imagePath}`;
  }
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
}

export type User = {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  created_at?: string;
};

export type Product = {
  id: number;
  name: string;
  model: string;
  category: string;
  brand: string;
  type: string;
  description: string;
  price: number | string;
  image: string;
  created_at?: string;
  updated_at?: string;
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
};

export type Review = {
  id: number;
  product_id: number;
  user_email: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type CartItem = {
  cart_id: number;
  quantity: number;
  product_id: number;
  name: string;
  model: string;
  brand: string;
  category: string;
  type: string;
  price: number | string;
  image: string;
};

export type OrderItem = {
  productId: number | string;
  name: string;
  model: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: number;
  user_email: string;
  username: string;
  phone: string;
  address: string;
  payment_method: string;
  order_status: "Placed" | "Shipped" | "Delivered" | "Cancelled";
  total_amount: number | string;
  items_json: OrderItem[] | string;
  created_at: string;
};

function getAuthHeaders(token?: string | null): HeadersInit {
  const currentToken =
    token || (typeof window !== "undefined" ? localStorage.getItem("hawkeye_token") : null);
  return {
    "Content-Type": "application/json",
    ...TUNNEL_HEADER,
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
  };
}

export function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error;
    if (obj.error && typeof (obj.error as Record<string, unknown>).message === "string") {
      return (obj.error as Record<string, unknown>).message as string;
    }
  }
  return fallback;
}

async function handleResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  let data: unknown = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await res.text();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new Error(extractErrorMessage(data, fallbackMessage));
  }

  return data as T;
}

export const api = {
  // Existing methods ...
  // Admin order details
  async getOrderById(id: string | number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/order/${id}`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    return handleResponse<Order>(res, "Failed to fetch order details");
  },

  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...TUNNEL_HEADER },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ user: User; token: string }>(res, "Login failed");
  },

  async register(details: { username: string; email: string; password: string; phone: string }) {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...TUNNEL_HEADER },
      body: JSON.stringify(details),
    });
    return handleResponse<User>(res, "Registration failed");
  },

  async getProfile(token?: string) {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders(token),
    });
    const data = await handleResponse<{ success: boolean; user: User }>(res, "Failed to fetch profile");
    return data.user;
  },

  async updateProfile(
    profileData: {
      username: string;
      email: string;
      phone: string;
      currentPassword?: string;
      newPassword?: string;
    },
    token?: string
  ) {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(profileData),
    });
    return handleResponse<{ success: boolean; message: string; user?: User }>(
      res,
      "Failed to update profile"
    );
  },

  // Products
  async getAllProducts(params?: { search?: string; category?: string; brand?: string }) {
    const url = new URL(`${API_BASE_URL}/products`);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.category && params.category !== "All")
      url.searchParams.set("category", params.category);
    if (params?.brand && params.brand !== "All")
      url.searchParams.set("brand", params.brand);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      ...(isTunnel ? { headers: TUNNEL_HEADER } : {}),
    });
    return handleResponse<Product[]>(res, "Failed to fetch products");
  },

  async getProductById(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/product/${id}`, {
      cache: "no-store",
      ...(isTunnel ? { headers: TUNNEL_HEADER } : {}),
    });
    return handleResponse<Product>(res, "Failed to fetch product");
  },

  async addProduct(formData: FormData, token?: string) {
    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("hawkeye_token") : null);
    const headers: Record<string, string> = { ...TUNNEL_HEADER };
    if (currentToken) headers.Authorization = `Bearer ${currentToken}`;
    const res = await fetch(`${API_BASE_URL}/product/add`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponse<Product>(res, "Failed to add product");
  },

  async updateProduct(id: string | number, formData: FormData, token?: string) {
    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("hawkeye_token") : null);
    const headers: Record<string, string> = { ...TUNNEL_HEADER };
    if (currentToken) headers.Authorization = `Bearer ${currentToken}`;
    const res = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: "PUT",
      headers,
      body: formData,
    });
    return handleResponse<Product>(res, "Failed to update product");
  },

  async deleteProduct(id: string | number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ message: string }>(res, "Failed to delete product");
  },

  // Cart
  async getCart(token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    return handleResponse<CartItem[]>(res, "Failed to fetch cart");
  },

  async addToCart(productId: number | string, quantity = 1, token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse<{ message: string; data?: unknown }>(res, "Failed to add to cart");
  },

  async incrementCart(cartId: number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/increment/${cartId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ message: string; data?: unknown }>(res, "Failed to increment cart");
  },

  async decrementCart(cartId: number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/decrement/${cartId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ message: string; data?: unknown }>(res, "Failed to decrement cart");
  },

  async removeCartItem(cartId: number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/remove/${cartId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ message: string }>(res, "Failed to remove item");
  },

  async clearCart(token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/remove`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ message: string }>(res, "Failed to clear cart");
  },

  // Orders
  async createOrder(
    orderData: {
      username: string;
      phone: string;
      address: string;
      paymentMethod?: string;
      items: OrderItem[];
      totalAmount: number;
    },
    token?: string
  ) {
    const res = await fetch(`${API_BASE_URL}/order/add`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(orderData),
    });
    return handleResponse<Order>(res, "Failed to place order");
  },

  async getMyOrders(token?: string) {
    const res = await fetch(`${API_BASE_URL}/myOrders`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    return handleResponse<Order[]>(res, "Failed to fetch orders");
  },

  async cancelOrder(orderId: number | string, token?: string) {
    const res = await fetch(`${API_BASE_URL}/myOrders/cancel/${orderId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ message: string; order?: Order }>(res, "Failed to cancel order");
  },

  // Admin
  async getAllOrders(token?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    return handleResponse<Order[]>(res, "Failed to fetch admin orders");
  },

  async updateOrderStatus(
    orderId: number | string,
    orderStatus: "Shipped" | "Delivered",
    token?: string
  ) {
    const res = await fetch(`${API_BASE_URL}/order/status/${orderId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ orderStatus }),
    });
    return handleResponse<{ message: string; order?: Order }>(
      res,
      "Failed to update order status"
    );
  },

  async getAllUsers(token?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    const data = await handleResponse<{ success: boolean; users: User[] }>(
      res,
      "Failed to fetch users"
    );
    return data.users;
  },

  async deleteUser(userId: number | string, token?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string }>(res, "Failed to delete user");
  },

  // Reviews
  async addReview(
    reviewData: { productId: number | string; rating: number; comment: string },
    token?: string
  ) {
    const res = await fetch(`${API_BASE_URL}/review/add`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(reviewData),
    });
    return handleResponse<{ message: string; review?: Review }>(res, "Failed to add review");
  },

  async getReviews(productId: number | string) {
    const res = await fetch(`${API_BASE_URL}/reviews/${productId}`, {
      cache: "no-store",
      ...(isTunnel ? { headers: TUNNEL_HEADER } : {}),
    });
    return handleResponse<Review[]>(res, "Failed to fetch reviews");
  },
};

