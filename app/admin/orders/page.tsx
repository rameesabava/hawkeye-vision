"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Order, OrderItem } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getAllOrders();
        setOrders(data);
      } catch (err) {
        const error = err as Error;
        toast.error(error.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const renderOrderCard = (o: Order) => {
    const items: OrderItem[] = Array.isArray(o.items_json)
      ? o.items_json
      : typeof o.items_json === "string"
      ? JSON.parse(o.items_json)
      : [];
    return (
      <div
        key={o.id}
        className="rounded-3xl border border-blue-100 bg-white p-6 shadow-md transition hover:shadow-lg text-slate-900 mb-4"
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
              Customer: <strong className="text-slate-900">{o.username}</strong> ({o.user_email}) • Phone: <strong className="text-slate-900">{o.phone}</strong>
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
        <div className="mt-4 flex justify-end">
          <Link
            href={`/admin/orders/${o.id}`}
            className="rounded-full bg-gray-200 px-4 py-1.5 text-xs font-bold text-gray-800 hover:bg-gray-300"
          >
            View Details
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-bold mb-6">All Orders</h1>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map(renderOrderCard)
        )}
      </div>
    </ProtectedRoute>
  );
}

