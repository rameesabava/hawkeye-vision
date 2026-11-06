"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, Order, OrderItem } from "@/lib/api";
import { toast } from "sonner";

export default function AdminOrderDetails() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.getOrderById(id);
        setOrder(data);
      } catch (err) {
        const error = err as Error;
        toast.error(error.message || "Failed to load order details.");
        router.replace("/admin?tab=active_orders");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const items: OrderItem[] = Array.isArray(order.items_json)
    ? order.items_json
    : typeof order.items_json === "string"
    ? JSON.parse(order.items_json)
    : [];

  return (
    <div className="mx-auto max-w-4xl p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <strong>Customer:</strong> {order.username} ({order.user_email})
        </div>
        <div>
          <strong>Phone:</strong> {order.phone}
        </div>
        <div className="col-span-2">
          <strong>Address:</strong> {order.address}
        </div>
        <div>
          <strong>Status:</strong> {order.order_status}
        </div>
        <div>
          <strong>Total:</strong> ₹{(parseFloat(String(order.total_amount)) || 0).toLocaleString("en-IN")}
        </div>
        <div>
          <strong>Placed At:</strong> {new Date(order.created_at).toLocaleString("en-IN")}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Items</h2>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="border p-2 rounded">
            <div className="flex justify-between">
              <span>{item.name} ({item.model})</span>
              <span>Qty: {item.quantity}</span>
            </div>
            <div>Price: ₹{item.price.toLocaleString("en-IN")}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

