"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, getImageUrl, Order, OrderItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success");
  const tabParam = searchParams.get("tab");

  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Tab filter: all vs active
  const [filterTab, setFilterTab] = useState<"all" | "active">(() => {
    return tabParam === "active" ? "active" : "all";
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [ordersPerPage, setOrdersPerPage] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (tabParam === "active") {
      setFilterTab("active");
    } else if (tabParam === "all") {
      setFilterTab("all");
    }
  }, [tabParam]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token && !loading) {
      router.push("/login?redirect=/orders");
      return;
    }
    if (user?.role === "admin") {
      router.replace("/admin?tab=orders");
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      setCancellingId(orderId);
      await api.cancelOrder(orderId);
      await fetchOrders();
      toast.success(`Order #${orderId} has been cancelled.`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: Order["order_status"]) => {
    switch (status) {
      case "Placed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Order Placed
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600 border border-sky-200">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            Shipped & Out for Delivery
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Delivered
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-300">
            {status}
          </span>
        );
    }
  };

  // Active orders list (Placed or Shipped)
  const activeOrders = orders.filter(
    (o) => o.order_status !== "Delivered" && o.order_status !== "Cancelled"
  );

  // Filter based on tab and optional search query
  const filteredOrders = (filterTab === "active" ? activeOrders : orders).filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const idMatch = String(o.id).includes(q);
    const statusMatch = o.order_status.toLowerCase().includes(q);
    let itemMatch = false;
    try {
      const items: OrderItem[] = Array.isArray(o.items_json)
        ? o.items_json
        : typeof o.items_json === "string"
        ? JSON.parse(o.items_json)
        : [];
      itemMatch = items.some(
        (it) => it.name.toLowerCase().includes(q) || (it.model && it.model.toLowerCase().includes(q))
      );
    } catch {
      // ignore JSON parse
    }
    return idMatch || statusMatch || itemMatch;
  });

  // Reset page when switching tabs or query
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTab, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  return (
    <div id="orders-container" className="mx-auto max-w-5xl">
      {/* Success Alert Banner when redirected from checkout */}
      {isSuccess && (
        <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white shadow">
            ✓
          </div>
          <h2 className="mt-3 text-lg font-bold text-emerald-900">
            Thank you! Your order was placed successfully.
          </h2>
          <p className="mt-1 text-sm text-emerald-700">
            We are processing your wholesale equipment order now. Track shipment progress below.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-block rounded-full bg-blue-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#081F4D] mb-2">
            Order History
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#081F4D] sm:text-4xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage all your wholesale equipment orders.
          </p>
        </div>

        <Link
          href="/products"
          className="rounded-full bg-[#081F4D] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#0A2660] shadow-md self-start sm:self-auto"
        >
          Order More Products
        </Link>
      </div>

      {/* Tabs & Search Row */}
      <div className="mt-8 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
              filterTab === "all"
                ? "bg-[#081F4D] text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-blue-50 border border-slate-200"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("active")}
            className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
              filterTab === "active"
                ? "bg-[#081F4D] text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-blue-50 border border-slate-200"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            Active Orders ({activeOrders.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by ID or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-[#081F4D] focus:outline-none focus:ring-2 focus:ring-[#081F4D]/10 transition"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-blue-100 bg-white p-12 text-center shadow-[0_10px_30px_rgba(8,31,77,0.05)] sm:p-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-[#081F4D]">
            {filterTab === "active" ? "⚡" : "📦"}
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#081F4D]">
            {searchQuery
              ? `No orders matching "${searchQuery}"`
              : filterTab === "active"
              ? "No active orders right now"
              : "No orders placed yet"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {filterTab === "active"
              ? "All your orders have either been delivered or cancelled."
              : "When you order products, they will appear here along with their shipping status."}
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-[#081F4D] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#0A2660] shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {paginatedOrders.map((order) => {
            const items: OrderItem[] = Array.isArray(order.items_json)
              ? order.items_json
              : typeof order.items_json === "string"
              ? JSON.parse(order.items_json)
              : [];

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-blue-100 bg-white p-6 sm:p-7 shadow-[0_10px_30px_rgba(8,31,77,0.05)] transition hover:border-blue-200"
              >
                {/* Order Header */}
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#081F4D] text-lg">
                      Order #{order.id}
                    </span>
                    {getStatusBadge(order.order_status)}
                  </div>

                  <div className="text-xs text-slate-400">
                    Placed on:{" "}
                    <strong className="text-slate-700">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-4 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                          {item.image ? (
                            <Image
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                              📷
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#081F4D]">{item.name}</div>
                          <div className="text-xs text-slate-400">
                            Model: {item.model} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>

                      <div className="font-bold text-[#081F4D]">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Footer */}
                <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-bold text-slate-700">Deliver to: </span>
                    <span className="text-slate-500">{order.address}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-[#081F4D] border border-blue-100">
                      {order.payment_method}
                    </span>

                    {order.order_status === "Placed" && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Orders Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={ordersPerPage}
            pageSize={ordersPerPage}
            pageSizeOptions={[4, 8, 12]}
            onPageSizeChange={(sz) => {
              setOrdersPerPage(sz);
              setCurrentPage(1);
            }}
            itemName={filterTab === "active" ? "active orders" : "orders"}
            scrollToId="orders-container"
          />
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-24 text-slate-900 sm:px-6 sm:pt-40 md:pt-48">
        <Suspense fallback={<div className="text-slate-500 text-sm">Loading orders...</div>}>
          <OrdersContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
