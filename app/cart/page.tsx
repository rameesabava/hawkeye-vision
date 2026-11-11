"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, CartItem, getImageUrl, OrderItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutParam = searchParams.get("checkout");
  const { user, token, refreshCartCount } = useAuth();
  const authToken = token ?? undefined;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Checkout state: auto-open checkout form if navigated from "Buy Now" (?checkout=true)
  const [isCheckingOut, setIsCheckingOut] = useState(
    () => checkoutParam === "true" || checkoutParam === "1"
  );
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (checkoutParam === "true" || checkoutParam === "1") {
      setIsCheckingOut(true);
    }
  }, [checkoutParam]);

  const fetchCart = useCallback(
    async (showSkeleton = true) => {
      try {
        if (showSkeleton) setLoading(true);
        const items = await api.getCart(authToken);
        setCartItems(items);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        toast.error("Could not load your cart. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [authToken]
  );

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (user) {
      setShippingName(user.username || "");
      setShippingPhone(user.phone || "");
    }
  }, [user]);

  const handleIncrement = async (cartId: number) => {
    try {
      setUpdatingId(cartId);
      await api.incrementCart(cartId, authToken);
      await fetchCart(false);
      await refreshCartCount();
      toast.success("Cart quantity increased.");
    } catch {
      toast.error("Failed to update item quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecrement = async (cartId: number) => {
    try {
      setUpdatingId(cartId);
      await api.decrementCart(cartId, authToken);
      await fetchCart(false);
      await refreshCartCount();
      toast.success("Cart quantity updated.");
    } catch {
      toast.error("Failed to update item quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartId: number) => {
    try {
      setUpdatingId(cartId);
      await api.removeCartItem(cartId, authToken);
      await fetchCart(false);
      await refreshCartCount();
      toast.info("Item removed from cart.");
    } catch {
      toast.error("Failed to remove item.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    try {
      setLoading(true);
      await api.clearCart(authToken);
      await fetchCart(false);
      await refreshCartCount();
      toast.info("Shopping cart cleared.");
    } catch {
      toast.error("Failed to clear cart.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (parseFloat(String(item.price)) || 0) * item.quantity,
    0
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim() || !shippingPhone.trim()) {
      toast.warning("Please fill in delivery address and phone number.");
      setCheckoutError("Please fill in delivery address and phone number.");
      return;
    }

    try {
      setPlacingOrder(true);
      setCheckoutError(null);

      const orderItems: OrderItem[] = cartItems.map((c) => ({
        productId: c.product_id,
        name: c.name,
        model: c.model,
        brand: c.brand,
        price: parseFloat(String(c.price)) || 0,
        quantity: c.quantity,
        image: c.image,
      }));

      await api.createOrder(
        {
          username: shippingName || user?.username || "Customer",
          phone: shippingPhone,
          address: shippingAddress.trim(),
          paymentMethod,
          items: orderItems,
          totalAmount: subtotal,
        },
        authToken
      );

      await refreshCartCount();
      toast.success("Order placed successfully! Thank you for ordering with Hawkeye Vision.");
      router.push("/orders?success=1");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to place order.");
      setCheckoutError(error.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-24 text-slate-900 sm:pt-40">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-blue-100" />
          <div className="h-40 rounded-3xl bg-white border border-blue-100" />
          <div className="h-40 rounded-3xl bg-white border border-blue-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-24 text-slate-900 sm:px-6 sm:pt-40 md:pt-48">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-block rounded-full bg-blue-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#081F4D]">
              Wholesale Cart
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#081F4D] sm:text-4xl">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review your items and proceed with your wholesale order.
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-xs font-bold text-red-500 transition hover:text-red-700"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-blue-100 bg-white p-12 text-center shadow-[0_10px_30px_rgba(8,31,77,0.06)] sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-[#081F4D]">
              🛒
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#081F4D]">Your cart is empty</h2>
            <p className="mt-2 text-sm text-slate-500">
              Browse our CCTV cameras, DVR, NVR, hard disks and network switches.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-full bg-[#081F4D] px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0A2660]"
            >
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items List */}
            <div className="space-y-4 lg:col-span-2">
              {cartItems.map((item) => {
                const itemTotal = (parseFloat(String(item.price)) || 0) * item.quantity;
                const imageUrl = getImageUrl(item.image);

                return (
                  <div
                    key={item.cart_id}
                    className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_8px_25px_rgba(8,31,77,0.05)] transition hover:border-blue-200 sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2 sm:h-24 sm:w-24">
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        sizes="100px"
                        className="object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                        {item.brand} • {item.model}
                      </div>
                      <Link
                        href={`/products/${item.product_id}`}
                        className="block truncate text-base font-bold text-[#081F4D] hover:underline"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 text-xs text-slate-500">{item.category}</div>
                      <div className="mt-2 text-sm font-bold text-[#081F4D]">
                        ₹{(parseFloat(String(item.price)) || 0).toLocaleString("en-IN")}{" "}
                        <span className="text-xs font-normal text-slate-400">each</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-3">
                      <div className="flex items-center rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item.cart_id)}
                          disabled={updatingId === item.cart_id}
                          className="px-1 text-sm font-bold text-[#081F4D] hover:text-blue-700 disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-[#081F4D]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(item.cart_id)}
                          disabled={updatingId === item.cart_id}
                          className="px-1 text-sm font-bold text-[#081F4D] hover:text-blue-700 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-[#081F4D]">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.cart_id)}
                          disabled={updatingId === item.cart_id}
                          className="mt-1 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Card */}
            <div className="h-fit rounded-3xl border border-blue-900 bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#081F4D] p-6 text-white shadow-xl sm:p-7">
              <h2 className="text-lg font-bold text-white">Order Summary</h2>

              <div className="mt-6 space-y-3 border-b border-white/15 pb-4 text-sm text-blue-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST / Taxes</span>
                  <span className="text-xs font-semibold text-sky-300">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-xs font-semibold text-sky-300">Free Wholesale Shipping</span>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between text-base">
                <span className="font-semibold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-white">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {!isCheckingOut ? (
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(true)}
                  className="mt-6 w-full rounded-full bg-white py-3.5 text-center text-sm font-bold text-[#081F4D] shadow-md transition hover:bg-blue-50"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className="mt-6 border-t border-white/15 pt-6">
                  <h3 className="text-sm font-bold text-white">Delivery & Contact Details</h3>

                  {checkoutError && (
                    <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/20 p-3 text-xs text-red-200">
                      {checkoutError}
                    </div>
                  )}

                  <form onSubmit={handlePlaceOrder} className="mt-4 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-200/80">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder-blue-200/50 focus:border-white focus:bg-white/15 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-200/80">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder-blue-200/50 focus:border-white focus:bg-white/15 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-200/80">
                        Complete Delivery Address
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Building, Street, Landmark, City, Pincode, State"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder-blue-200/50 focus:border-white focus:bg-white/15 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-200/80">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/20 bg-[#0A2660] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                      >
                        <option value="Cash on Delivery" className="bg-[#081F4D] text-white">
                          Cash on Delivery
                        </option>
                        <option value="UPI / Online on Delivery" className="bg-[#081F4D] text-white">
                          UPI / QR on Delivery
                        </option>
                        
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={placingOrder}
                      className="mt-4 w-full rounded-full bg-white py-3.5 text-center text-sm font-bold text-[#081F4D] shadow-md transition hover:bg-blue-50 disabled:opacity-50"
                    >
                      {placingOrder ? "Placing Order..." : "Confirm & Place Order"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="w-full pt-1 text-center text-xs font-semibold text-blue-200 hover:text-white"
                    >
                      Back to Summary
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-24 text-slate-900 sm:pt-40">
            <div className="mx-auto max-w-5xl animate-pulse space-y-6">
              <div className="h-8 w-48 rounded bg-blue-100" />
              <div className="h-40 rounded-3xl bg-white border border-blue-100" />
            </div>
          </div>
        }
      >
        <CartContent />
      </Suspense>
    </ProtectedRoute>
  );
}