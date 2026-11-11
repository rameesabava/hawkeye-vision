"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getImageUrl, Product, Review } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";

export default function SingleProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, token, refreshCartCount } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Reviews Pagination
  const REVIEWS_PER_PAGE = 4;
  const [reviewPage, setReviewPage] = useState(1);

  const reviewsList = product?.reviews || [];
  const totalReviewPages = Math.ceil(reviewsList.length / REVIEWS_PER_PAGE) || 1;
  const paginatedReviews = reviewsList.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await api.getProductById(resolvedParams.id);
        setProduct(data);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [resolvedParams.id]);

  const handleAddToCart = async () => {
    if (!product) return;

    const savedToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("hawkeye_token") : null);

    if (!user && !savedToken) {
      toast.error("Please log in to add items to your cart", {
        description: "You must be signed in to purchase products.",
        action: {
          label: "Login",
          onClick: () => router.push(`/login?redirect=/products/${product.id}`),
        },
      });
      return;
    }

    try {
      setAddingToCart(true);
      await api.addToCart(product.id, quantity, savedToken || undefined);
      await refreshCartCount();

      toast.success(`"${product.name}" added to cart successfully! (Qty: ${quantity})`, {
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to add product to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    const savedToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("hawkeye_token") : null);

    if (!user && !savedToken) {
      toast.error("Please log in to complete your purchase", {
        description: "You must be signed in to purchase products.",
        action: {
          label: "Login",
          onClick: () => router.push(`/login?redirect=/products/${product.id}`),
        },
      });
      router.push(`/login?redirect=/products/${product.id}`);
      return;
    }

    try {
      setBuyingNow(true);
      await api.addToCart(product.id, quantity, savedToken || undefined);
      await refreshCartCount();
      toast.success(`Proceeding to checkout for "${product.name}"...`);
      router.push("/cart?checkout=true");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to proceed to checkout. Please try again.");
    } finally {
      setBuyingNow(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) {
      toast.error("Please sign in to submit a review.", {
        action: {
          label: "Login",
          onClick: () => router.push(`/login?redirect=/products/${product?.id}`),
        },
      });
      return;
    }

    if (!comment.trim()) {
      toast.warning("Please enter your review feedback.");
      setReviewError("Please enter a review comment.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);
      const res = await api.addReview({
        productId: product.id,
        rating,
        comment: comment.trim(),
      });

      // Update product reviews locally
      if (res.review) {
        const newReview = res.review;
        setProduct((prev) => {
          if (!prev) return prev;
          const updatedReviews: Review[] = [newReview, ...(prev.reviews || [])];
          const avg =
            updatedReviews.reduce((sum, r) => sum + Number(r.rating), 0) /
            updatedReviews.length;
          return {
            ...prev,
            reviews: updatedReviews,
            avgRating: Number(avg.toFixed(1)),
            reviewCount: updatedReviews.length,
          };
        });
      }

      setComment("");
      setRating(5);
      setReviewPage(1);
      toast.success("Thank you! Your review has been submitted successfully.");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to submit review.");
      setReviewError(error.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-24 text-slate-900 sm:pt-40">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-6 w-48 rounded bg-blue-100" />
          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="aspect-square rounded-3xl bg-blue-50 border border-blue-100" />
            <div className="space-y-6">
              <div className="h-8 w-3/4 rounded bg-blue-100" />
              <div className="h-6 w-1/3 rounded bg-blue-100" />
              <div className="h-24 w-full rounded bg-blue-100" />
              <div className="h-12 w-48 rounded bg-blue-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-24 text-center text-slate-900 sm:pt-40">
        <div className="mx-auto max-w-lg rounded-3xl border border-blue-100 bg-white p-8 shadow-md sm:p-12">
          <h1 className="text-2xl font-bold text-[#081F4D]">Product Not Found</h1>
          <p className="mt-3 text-slate-600">
            {error || "The product you requested could not be found."}
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-[#081F4D] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0A2660]"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.image);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-24 text-slate-900 sm:px-6 sm:pt-40 md:pt-48">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
          <Link href="/" className="hover:text-[#081F4D] transition font-medium">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#081F4D] transition font-medium">
            Products
          </Link>
          <span>/</span>
          <span className="truncate text-[#081F4D] font-bold">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Image Display */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white p-8 border border-blue-100 shadow-[0_10px_30px_rgba(8,31,77,0.06)]">
            {!imageError && imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-6"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-3xl font-bold text-slate-400">
                {product.brand}
              </div>
            )}
            <div className="absolute top-4 left-4 rounded-full bg-[#081F4D] px-3.5 py-1.5 text-xs font-bold text-white shadow">
              {product.brand}
            </div>
            {product.type && (
              <div className="absolute top-4 right-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#081F4D] border border-blue-100">
                {product.type}
              </div>
            )}
          </div>

          {/* Product Specifications & Order Actions */}
          <div className="flex flex-col">
            <div className="inline-block self-start rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#081F4D]">
              {product.category}
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#081F4D] sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
              <span>
                Model: <strong className="text-slate-800">{product.model}</strong>
              </span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">★</span>
                <span className="font-bold text-slate-800">
                  {product.avgRating ? product.avgRating : "New"}
                </span>
                <span className="text-xs text-slate-400">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            <div className="mt-6 border-y border-slate-200 py-4">
              <div className="text-2xl font-bold text-[#081F4D] sm:text-3xl">
                {Number(product.price) > 0
                  ? `₹${Number(product.price).toLocaleString("en-IN")}`
                  : "Price on request"}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Wholesale tax included. Express delivery available across India.
              </p>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Overview & Description
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {product.description}
              </p>
            </div>

            {/* Product Meta Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-blue-100 bg-white p-4 text-xs shadow-sm">
              <div>
                <span className="text-slate-500">Brand:</span>{" "}
                <span className="font-bold text-[#081F4D]">{product.brand}</span>
              </div>
              <div>
                <span className="text-slate-500">Category:</span>{" "}
                <span className="font-bold text-[#081F4D]">{product.category}</span>
              </div>
              <div>
                <span className="text-slate-500">Model:</span>{" "}
                <span className="font-bold text-[#081F4D]">{product.model}</span>
              </div>
              <div>
                <span className="text-slate-500">Type:</span>{" "}
                <span className="font-bold text-[#081F4D]">{product.type || "Standard"}</span>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Quantity Counter */}
              <div className="flex items-center justify-between rounded-full border border-blue-200 bg-white px-4 py-2 sm:w-36 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-lg font-bold text-[#081F4D] hover:text-blue-700"
                >
                  −
                </button>
                <span className="text-sm font-bold text-[#081F4D]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-lg font-bold text-[#081F4D] hover:text-blue-700"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart || buyingNow}
                className="flex-1 rounded-full border-2 border-[#081F4D] bg-white px-8 py-3.5 text-center text-sm font-bold text-[#081F4D] transition hover:bg-blue-50 shadow-sm disabled:opacity-60"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={addingToCart || buyingNow}
                className="flex-1 rounded-full bg-[#081F4D] px-8 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#0A2660] shadow-md disabled:opacity-60"
              >
                {buyingNow ? "Proceeding..." : "Buy Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div id="reviews-section" className="mt-20 border-t border-slate-200 pt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#081F4D] sm:text-3xl">
                Customer Reviews
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Verified feedback from clients and security installers.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-5 py-3 shadow-sm">
              <span className="text-3xl font-extrabold text-[#081F4D]">
                {product.avgRating ? product.avgRating : "0.0"}
              </span>
              <div>
                <div className="flex text-amber-400 text-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= Math.round(product.avgRating || 0) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-slate-400">
                  Based on {product.reviewCount || 0} reviews
                </div>
              </div>
            </div>
          </div>

          {/* Add Review Form */}
          <div className="mt-8 rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(8,31,77,0.05)]">
            <h3 className="text-lg font-bold text-[#081F4D]">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                {reviewSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                    Thank you! Your review has been submitted successfully.
                  </div>
                )}
                {reviewError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                    {reviewError}
                  </div>
                )}

                {/* Star rating selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Your Rating
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl transition hover:scale-110 ${
                          star <= rating ? "text-amber-400" : "text-slate-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-slate-500 font-medium">
                      {rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Review comment */}
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    Your Review
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    placeholder="Share your experience with this model (performance, installation, durability)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-[#081F4D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-full bg-[#081F4D] px-8 py-3 text-xs font-bold text-white transition hover:bg-[#0A2660] shadow-md"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-600">
                  Please sign in to write a review for this product.
                </p>
                <Link
                  href={`/login?redirect=/products/${product.id}`}
                  className="mt-4 inline-block rounded-full bg-[#081F4D] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#0A2660] shadow-md"
                >
                  Login to Review
                </Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="mt-8 space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              <>
                {paginatedReviews.map((rev: Review) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm text-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#081F4D] text-xs font-bold text-white shadow-sm">
                          {rev.username ? rev.username.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className="font-bold text-sm text-[#081F4D]">
                          {rev.username}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="mt-2 flex text-amber-400 text-xs">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s}>{s <= rev.rating ? "★" : "☆"}</span>
                      ))}
                    </div>

                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}

                {/* Reviews Pagination Controls */}
                <Pagination
                  currentPage={reviewPage}
                  totalPages={totalReviewPages}
                  onPageChange={setReviewPage}
                  totalItems={reviewsList.length}
                  itemsPerPage={REVIEWS_PER_PAGE}
                  itemName="reviews"
                  scrollToId="reviews-section"
                />
              </>
            ) : (
              <div className="rounded-2xl border border-blue-100 bg-white p-8 text-center text-sm text-slate-500">
                No reviews yet for this product. Be the first to leave a review!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

