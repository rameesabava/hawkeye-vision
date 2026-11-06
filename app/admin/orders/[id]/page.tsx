"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api, Order, OrderItem, getImageUrl } from "@/lib/api";
import { toast } from "sonner";

export default function AdminOrderDetailPage() {

  const params = useParams();
  const orderId = Number(params?.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const data = await api.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        const e = err as Error;
        toast.error(e.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: "Shipped" | "Delivered") => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.updateOrderStatus(order.id, newStatus);
      // Refresh order data
      const refreshed = await api.getOrderById(order.id);
      setOrder(refreshed);
      toast.success("Order status updated.");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-gray-600">Loading order...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="p-6">
          <p className="text-red-600">Order not found.</p>
          <Link href="/admin/orders" className="text-blue-600 underline">
            Back to Orders
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const items: OrderItem[] = Array.isArray(order.items_json)
    ? order.items_json
    : typeof order.items_json === "string"
    ? JSON.parse(order.items_json)
    : [];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="mx-auto max-w-4xl p-6 pt-24">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <Link href="/admin/orders" className="text-sm text-blue-600 underline">
            ← Back to Orders
          </Link>
        </div>
        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-md">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center border-b pb-4 mb-4">
            <div>
              <span className="font-extrabold text-[#081F4D] text-lg">Status:</span>{" "}
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  order.order_status === "Placed"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : order.order_status === "Shipped"
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : order.order_status === "Delivered"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {order.order_status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-[#081F4D]">
                ₹{(parseFloat(String(order.total_amount)) || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-500">
                {new Date(order.created_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
          {/* Customer Info */}
          <div className="mb-4 text-sm">
            <p>
              <strong>Customer:</strong> {order.username} ({order.user_email})
            </p>
            <p>
              <strong>Phone:</strong> {order.phone}
            </p>
          </div>
          {/* Items List */}
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Items</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-xl bg-blue-50/80 p-3 border border-blue-100"
                >
                  <img
                    src={getImageUrl(it.image)}
                    alt={it.name}
                    className="h-16 w-16 object-cover rounded"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#081F4D]">
                      {it.name} ({it.model})
                    </span>
                    {it.brand && (
                      <span className="text-sm text-slate-600">Brand: {it.brand}</span>
                    )}
                    <span className="text-sm text-slate-600">
                      Qty: {it.quantity} × ₹{it.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            {order.order_status === "Placed" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("Shipped")}
                disabled={updating}
                className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-500"
              >
                Mark as Shipped
              </button>
            )}
            {order.order_status === "Shipped" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("Delivered")}
                disabled={updating}
                className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
