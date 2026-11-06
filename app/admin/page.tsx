"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, getImageUrl, Order, OrderItem, Product, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "Analog Camera",
  "DVR",
  "IP Camera",
  "NVR",
  "Cables",
  "Switches",
  "Accessories",
  "Monitors",
  "Biometric attendance",
  "Video Door Phones",
  "Boom Barriers",
  "Interactive Panels",
];

const BRANDS = [
  "Hikvision",
  "CP Plus",
  "TP Link",
  "Zebronics",
  "Dahua",
  "Panasonic",
  "Toshiba",
  "Western Digital",
  "D Link",
  "Hi Focus",
  "eSSL",
];

type AdminTab = "products" | "active_orders" | "orders" | "users";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { user, token, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (tabParam === "active_orders" || tabParam === "active-orders") return "active_orders";
    if (tabParam === "orders") return "orders";
    if (tabParam === "users" || tabParam === "customers") return "users";
    return "products";
  });

  useEffect(() => {
    if (tabParam === "active_orders" || tabParam === "active-orders") {
      setActiveTab("active_orders");
    } else if (tabParam === "orders") {
      setActiveTab("orders");
    } else if (tabParam === "users" || tabParam === "customers") {
      setActiveTab("users");
    } else if (tabParam === "products") {
      setActiveTab("products");
    }
  }, [tabParam]);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form inputs for Add / Edit product
  const [pName, setPName] = useState("");
  const [pModel, setPModel] = useState("");
  const [pCategory, setPCategory] = useState("Analog Camera");
  const [pBrand, setPBrand] = useState("Hikvision");
  const [pType, setPType] = useState("Bullet Camera");
  const [pDescription, setPDescription] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pImageFile, setPImageFile] = useState<File | null>(null);
  const [pImagePreview, setPImagePreview] = useState<string | null>(null);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  // Search in tabs
  const [searchFilter, setSearchFilter] = useState("");

  // Check auth and role
  useEffect(() => {
    if (!authLoading) {
      if (!token || !user) {
        router.push("/login?redirect=/admin");
      } else if (user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, token, authLoading, router]);

  // Load data based on active tab
  const fetchProducts = async () => {
    if (user?.role !== "admin") return;

    try {
      setProductsLoading(true);
      const data = await api.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }


  const fetchOrders = async () => {
    if (user?.role !== "admin") return;
    try {
      setOrdersLoading(true);
      const data = await api.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }


  const fetchUsers = async () => {
    if (user?.role !== "admin") return;
    try {
      setUsersLoading(true);
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }


  // Fetch all dashboard data initially so all stats reflect actual numbers immediately
  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
      fetchOrders();
      fetchUsers();
    }
  }, [user]);

  // Refresh tab data when switching tabs
  useEffect(() => {
    if (user?.role === "admin") {
      if (activeTab === "products") fetchProducts();
      if (activeTab === "orders" || activeTab === "active_orders") fetchOrders();
      if (activeTab === "users") fetchUsers();
    }
  }, [activeTab]);

  // Open modal for Adding new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setPName("");
    setPModel("");
    setPCategory("Analog Camera");
    setPBrand("Hikvision");
    setPType("Fixed Bullet Camera");
    setPDescription("");
    setPPrice("");
    setPImageFile(null);
    setPImagePreview(null);
    setProductFormError(null);
    setProductModalOpen(true);


  // Open modal for Editing existing product
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setPName(p.name);
    setPModel(p.model);
    setPCategory(p.category);
    setPBrand(p.brand);
    setPType(p.type || "Fixed Bullet Camera");
    setPDescription(p.description || "");
    setPPrice(String(p.price));
    setPImageFile(null);
    setPImagePreview(getImageUrl(p.image));
    setProductFormError(null);
    setProductModalOpen(true);


  // Handle product form submission (Create or Update)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError(null);

    if (!pName.trim() || !pModel.trim() || !pPrice.trim()) {
      setProductFormError("Please fill out name, model, and price.");
      return;
    }

    const priceNum = parseFloat(pPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setProductFormError("Please enter a valid price amount.");
      return;
    }

    try {
      setProductSubmitting(true);
      const formData = new FormData();
      formData.append("name", pName.trim());
      formData.append("model", pModel.trim());
      formData.append("category", pCategory);
      formData.append("brand", pBrand);
      formData.append("type", pType.trim());
      formData.append("description", pDescription.trim());
      formData.append("price", String(priceNum));

      if (pImageFile) {
        formData.append("image", pImageFile);
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        toast.success(`Product "${pName}" updated successfully!`);
      } else {
        await api.addProduct(formData);
        toast.success(`Product "${pName}" added to inventory!`);
      }

      setProductModalOpen(false);
      await fetchProducts();
    } catch (err: unknown) {
      const error = err as Error;
      setProductFormError(error.message || "Failed to save product.");
      toast.error(error.message || "Failed to save product.");
    } finally {
      setProductSubmitting(false);
    }


  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.deleteProduct(id);
      await fetchProducts();
      toast.info("Product removed from database.");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete product.");
    }


  // Update order status (Shipped / Delivered)
  const handleUpdateOrderStatus = async (orderId: number, status: "Shipped" | "Delivered") => {
    try {
      setUpdatingOrderId(orderId);
      await api.updateOrderStatus(orderId, status);
      await fetchOrders();
      toast.success(`Order #${orderId} marked as ${status}.`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }


  // Delete user
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      setDeletingUserId(userId);
      await api.deleteUser(userId);
      await fetchUsers();
      toast.info("Customer account deleted.");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }


  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#071838] text-white">
        <div className="animate-pulse text-sm text-blue-200">Loading admin privileges...</div>
      </div>
    );
  }

  // Filtered views
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.model.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const activeOrdersList = orders.filter(
    (o) => o.order_status !== "Delivered" && o.order_status !== "Cancelled"
  );

  const filteredActiveOrders = activeOrdersList.filter(
    (o) =>
      String(o.id).includes(searchFilter) ||
      o.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.user_email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.order_status.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      String(o.id).includes(searchFilter) ||
      o.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.user_email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.order_status.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.phone.includes(searchFilter)
  );

  // Pagination states
  const [adminProductsPerPage, setAdminProductsPerPage] = useState(6);
  const [adminActiveOrdersPerPage, setAdminActiveOrdersPerPage] = useState(5);
  const [adminOrdersPerPage, setAdminOrdersPerPage] = useState(5);
  const [adminUsersPerPage, setAdminUsersPerPage] = useState(6);

  const [productPage, setProductPage] = useState(1);
  const [activeOrderPage, setActiveOrderPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  // Reset to first page when filtering or changing tabs
  useEffect(() => {
    setProductPage(1);
    setActiveOrderPage(1);
    setOrderPage(1);
    setUserPage(1);
  }, [searchFilter, activeTab]);

  const totalProductPages = Math.ceil(filteredProducts.length / adminProductsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * adminProductsPerPage,
    productPage * adminProductsPerPage
  );

  const totalActiveOrderPages = Math.ceil(filteredActiveOrders.length / adminActiveOrdersPerPage) || 1;
  const paginatedActiveOrders = filteredActiveOrders.slice(
    (activeOrderPage - 1) * adminActiveOrdersPerPage,
    activeOrderPage * adminActiveOrdersPerPage
  );

  const totalOrderPages = Math.ceil(filteredOrders.length / adminOrdersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * adminOrdersPerPage,
    orderPage * adminOrdersPerPage
  );

  const totalUserPages = Math.ceil(filteredUsers.length / adminUsersPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * adminUsersPerPage,
    userPage * adminUsersPerPage
  );

  // Reusable order card renderer
  const renderOrderCard = (o: Order) => {
  const items: OrderItem[] = Array.isArray(o.items_json)
    ? o.items_json
    : typeof o.items_json === "string"
    ? JSON.parse(o.items_json)
    : [];

  return (
    <div
      key={o.id}
      className="rounded-3xl border border-blue-100 bg-white p-6 shadow-md transition hover:shadow-lg text-slate-900"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-[#081F4D] text-base">Order #{o.id}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                o.order_status === "Placed"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : o.order_status === "Shipped"
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : o.order_status === "Delivered"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              ● {o.order_status}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Customer: <strong className="text-slate-900">{o.username}</strong> ({o.user_email}) • Phone:{" "}
            <strong className="text-slate-900">{o.phone}</strong>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-lg font-black text-[#081F4D]">
            ₹{(parseFloat(String(o.total_amount)) || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            {new Date(o.created_at).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {items.map((it, idx) => (
          <span
            key={idx}
            className="rounded-xl bg-blue-50/80 px-3 py-1.5 font-semibold text-[#081F4D] border border-blue-100"
          >
            {it.name} ({it.model}) × {it.quantity}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
        <div>
          <span className="font-bold text-slate-800">Shipping Address:</span> {o.address}
        </div>

        {/* Status update buttons */}
        <div className="flex items-center gap-2">
          {o.order_status === "Placed" && (
            <button
              type="button"
              onClick={() => handleUpdateOrderStatus(o.id, "Shipped")}
              disabled={updatingOrderId === o.id}
              className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-sky-500 shadow-sm"
            >
              Mark as Shipped
            </button>
          )}

          {o.order_status === "Shipped" && (
            <button
              type="button"
              onClick={() => handleUpdateOrderStatus(o.id, "Delivered")}
              disabled={updatingOrderId === o.id}
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-sm"
            >
              Mark as Delivered
            </button>
          )}
          {/* View Details Link */}
          <Link
            href={`/admin/orders/${o.id}`}
            className="rounded-full bg-gray-200 px-4 py-1.5 text-xs font-bold text-gray-800 hover:bg-gray-300"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#071838] px-4 pt-32 pb-24 text-white sm:px-6 sm:pt-40 md:pt-48">
      <div className="mx-auto max-w-6xl">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-400/20 px-3 py-1 text-xs font-bold text-sky-300 uppercase tracking-wider border border-sky-400/30">
                Admin Console
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Hawkeye Vision Management
            </h1>
            <p className="mt-1 text-sm text-blue-100/75">
              Manage products inventory, track wholesale customer orders, and manage users.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 backdrop-blur"
            >
              Update Admin Profile
            </Link>
            {activeTab === "products" && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-[#081F4D] transition hover:bg-blue-50 shadow-md"
              >
                + Add New Product
              </button>
            )}
          </div>
        </div>

        {/* Stats Row - Interactive Clickable Stat Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab("products");
              setSearchFilter("");
            }}
            className={`text-left rounded-3xl border p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer ${
              activeTab === "products"
                ? "bg-white border-[#081F4D] ring-2 ring-white/60"
                : "bg-white border-blue-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Products</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-base text-[#081F4D]">📦</span>
            </div>
            <div className="mt-2 text-3xl font-black text-[#081F4D]">{products.length}</div>
            <div className="mt-1 text-[11px] font-medium text-emerald-600">● Live in Catalog</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("active_orders");
              setSearchFilter("");
            }}
            className={`text-left rounded-3xl border p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer ${
              activeTab === "active_orders"
                ? "bg-white border-sky-500 ring-2 ring-sky-300"
                : "bg-white border-blue-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Orders</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-base text-sky-600">⚡</span>
            </div>
            <div className="mt-2 text-3xl font-black text-sky-600">
              {activeOrdersList.length}
            </div>
            <div className="mt-1 text-[11px] font-medium text-sky-600">● In Fulfillment (View)</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("users");
              setSearchFilter("");
            }}
            className={`text-left rounded-3xl border p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer ${
              activeTab === "users"
                ? "bg-white border-[#081F4D] ring-2 ring-white/60"
                : "bg-white border-blue-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Customers</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-base text-indigo-600">👥</span>
            </div>
            <div className="mt-2 text-3xl font-black text-[#081F4D]">{users.length}</div>
            <div className="mt-1 text-[11px] font-medium text-slate-500">● Registered Accounts</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("orders");
              setSearchFilter("");
            }}
            className={`text-left rounded-3xl border p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer ${
              activeTab === "orders"
                ? "bg-white border-[#081F4D] ring-2 ring-white/60"
                : "bg-white border-blue-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-base text-[#081F4D]">🛒</span>
            </div>
            <div className="mt-2 text-3xl font-black text-[#081F4D]">{orders.length}</div>
            <div className="mt-1 text-[11px] font-medium text-slate-500">● Lifetime Orders</div>
          </button>
        </div>

        {/* Navigation Tabs & Search */}
        <div id="admin-content-area" className="mt-8 flex flex-col gap-4 border-b border-white/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("products");
                setSearchFilter("");
              }}
              className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                activeTab === "products"
                  ? "bg-white text-[#081F4D] shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
              }`}
            >
              Products ({products.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("active_orders");
                setSearchFilter("");
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                activeTab === "active_orders"
                  ? "bg-white text-sky-700 shadow-md ring-2 ring-sky-300"
                  : "bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 border border-sky-400/40"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              Active Orders ({activeOrdersList.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("orders");
                setSearchFilter("");
              }}
              className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                activeTab === "orders"
                  ? "bg-white text-[#081F4D] shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("users");
                setSearchFilter("");
              }}
              className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                activeTab === "users"
                  ? "bg-white text-[#081F4D] shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
              }`}
            >
              Customers ({users.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={
                activeTab === "products"
                  ? "Search products..."
                  : activeTab === "active_orders"
                  ? "Search active orders..."
                  : activeTab === "orders"
                  ? "Search all orders..."
                  : "Search customers..."
              }
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-xs text-white placeholder-blue-200/50 backdrop-blur focus:bg-white focus:text-[#081F4D] focus:placeholder-slate-400 focus:outline-none transition"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200/60"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: PRODUCTS INVENTORY */}
        {activeTab === "products" && (
          <div className="mt-6">
            {productsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/20" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-blue-100 bg-white p-12 text-center text-sm text-slate-600 shadow-md">
                No products found matching &quot;{searchFilter}&quot;.
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="group flex flex-col justify-between rounded-3xl border border-blue-100 bg-white p-5 shadow-md transition duration-300 hover:shadow-xl hover:-translate-y-1 text-slate-900"
                    >
                      <div>
                        {/* Image Preview */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
                          {p.image ? (
                            <Image
                              src={getImageUrl(p.image)}
                              alt={p.name}
                              fill
                              className="object-contain p-2 transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                              No image
                            </div>
                          )}
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#081F4D]/90 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur">
                            {p.brand}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-4">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                            {p.category}
                          </div>
                          <h3 className="mt-0.5 line-clamp-1 font-bold text-base text-[#081F4D]">
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">Model: {p.model}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600 leading-relaxed">
                            {p.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-base font-extrabold text-[#081F4D]">
                          ₹{parseFloat(String(p.price)).toLocaleString("en-IN")}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#081F4D] border border-blue-200 transition hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 border border-red-200 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Products Pagination Controls */}
                <Pagination
                  currentPage={productPage}
                  totalPages={totalProductPages}
                  onPageChange={setProductPage}
                  totalItems={filteredProducts.length}
                  itemsPerPage={adminProductsPerPage}
                  pageSize={adminProductsPerPage}
                  pageSizeOptions={[6, 12, 24]}
                  onPageSizeChange={(sz) => {
                    setAdminProductsPerPage(sz);
                    setProductPage(1);
                  }}
                  itemName="products"
                  scrollToId="admin-content-area"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE ORDERS MANAGEMENT */}
        {activeTab === "active_orders" && (
          <div className="mt-6">
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-44 animate-pulse rounded-3xl bg-white/20" />
                ))}
              </div>
            ) : filteredActiveOrders.length === 0 ? (
              <div className="rounded-3xl border border-blue-100 bg-white p-12 text-center shadow-md">
                <div className="text-4xl">🎉</div>
                <div className="mt-3 text-lg font-bold text-[#081F4D]">
                  {searchFilter ? `No active orders match "${searchFilter}".` : "No active orders waiting for fulfillment."}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {searchFilter ? "Try clearing your search keyword." : "All wholesale customer orders are currently delivered or cancelled."}
                </p>
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter("")}
                    className="mt-4 rounded-full bg-[#081F4D] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#0A2660]"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedActiveOrders.map((o) => renderOrderCard(o))}

                {/* Active Orders Pagination Controls */}
                <Pagination
                  currentPage={activeOrderPage}
                  totalPages={totalActiveOrderPages}
                  onPageChange={setActiveOrderPage}
                  totalItems={filteredActiveOrders.length}
                  itemsPerPage={adminActiveOrdersPerPage}
                  pageSize={adminActiveOrdersPerPage}
                  pageSizeOptions={[5, 10, 20]}
                  onPageSizeChange={(sz) => {
                    setAdminActiveOrdersPerPage(sz);
                    setActiveOrderPage(1);
                  }}
                  itemName="active orders"
                  scrollToId="admin-content-area"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALL ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="mt-6">
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-44 animate-pulse rounded-3xl bg-white/20" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-blue-100 bg-white p-12 text-center text-sm text-slate-600 shadow-md">
                No orders match your filter.
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedOrders.map((o) => renderOrderCard(o))}

                {/* Orders Pagination Controls */}
                <Pagination
                  currentPage={orderPage}
                  totalPages={totalOrderPages}
                  onPageChange={setOrderPage}
                  totalItems={filteredOrders.length}
                  itemsPerPage={adminOrdersPerPage}
                  pageSize={adminOrdersPerPage}
                  pageSizeOptions={[5, 10, 20]}
                  onPageSizeChange={(sz) => {
                    setAdminOrdersPerPage(sz);
                    setOrderPage(1);
                  }}
                  itemName="orders"
                  scrollToId="admin-content-area"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS / CUSTOMERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="mt-6">
            {usersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/20" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-3xl border border-blue-100 bg-white p-12 text-center text-sm text-slate-600 shadow-md">
                No customers found matching &quot;{searchFilter}&quot;.
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between shadow-md transition hover:shadow-lg text-slate-900"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#081F4D] font-bold text-white text-sm shadow-sm">
                        {u.username ? u.username.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="font-bold text-base text-[#081F4D]">{u.username}</div>
                        <div className="text-xs text-slate-600">
                          {u.email} • Phone: <span className="font-medium text-slate-900">{u.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400 font-medium">
                        Joined:{" "}
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={deletingUserId === u.id}
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 font-bold text-red-600 hover:bg-red-100 transition shadow-sm"
                      >
                        Delete Customer
                      </button>
                    </div>
                  </div>
                ))}

                {/* Users Pagination Controls */}
                <Pagination
                  currentPage={userPage}
                  totalPages={totalUserPages}
                  onPageChange={setUserPage}
                  totalItems={filteredUsers.length}
                  itemsPerPage={adminUsersPerPage}
                  pageSize={adminUsersPerPage}
                  pageSizeOptions={[6, 12, 24]}
                  onPageSizeChange={(sz) => {
                    setAdminUsersPerPage(sz);
                    setUserPage(1);
                  }}
                  itemName="customers"
                  scrollToId="admin-content-area"
                />
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD / EDIT PRODUCT */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-[#081F4D]">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  ✕
                </button>
              </div>

              {productFormError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {productFormError}
                </div>
              )}

              <form onSubmit={handleProductSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. 2MP ColorVu Fixed Bullet Camera"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#081F4D] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Model Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={pModel}
                      onChange={(e) => setPModel(e.target.value)}
                      placeholder="e.g. DS-2CE10DF0T-F"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#081F4D] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Price (INR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      placeholder="e.g. 1850"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#081F4D] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Category
                    </label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#081F4D] focus:bg-white focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Brand
                    </label>
                    <select
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#081F4D] focus:bg-white focus:outline-none"
                    >
                      {BRANDS.map((br) => (
                        <option key={br} value={br}>
                          {br}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Type / Sub-type
                  </label>
                  <input
                    type="text"
                    value={pType}
                    onChange={(e) => setPType(e.target.value)}
                    placeholder="e.g. Fixed Bullet Camera, Dome Camera"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#081F4D] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    placeholder="Detailed specifications, optical reach, sensor quality..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#081F4D] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPImageFile(file);
                      if (file) {
                        setPImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="mt-1 w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-[#081F4D] hover:file:bg-blue-100"
                  />

                  {pImagePreview && (
                    <div className="relative mt-2 h-28 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <Image
                        src={pImagePreview}
                        alt="Preview"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="flex-1 rounded-full border border-slate-200 py-3 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={productSubmitting}
                    className="flex-1 rounded-full bg-[#081F4D] py-3 text-center text-xs font-bold text-white transition hover:bg-[#0A2660] disabled:opacity-50 shadow-md"
                  >
                    {productSubmitting
                      ? "Saving..."
                      : editingProduct
                      ? "Save Product"
                      : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#081F4D] text-white text-sm">
            Loading admin console...
          </div>
        }
      >
        <AdminDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
