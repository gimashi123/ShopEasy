import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { productService, type Product } from "@/services/productService";
import { supermarketService, type Supermarket } from "@/services/supermarketService";
import { reviewService, type Review } from "@/services/reviewService";
import { resolveProductImageUrl } from "@/lib/productImage";
import { ArrowLeft, Package, Star, Store, CheckCircle, ShieldCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.allSettled([
      productService.getById(id),
      supermarketService.getAll(),
      reviewService.getByProductId(id)
    ])
        .then(([productResult, marketResult, reviewResult]) => {
          if (productResult.status === "fulfilled") setProduct(productResult.value);
          else toast.error("Failed to load product details");

          if (marketResult.status === "fulfilled") setSupermarkets(marketResult.value);

          if (reviewResult.status === "fulfilled") setReviews(reviewResult.value);
          else toast.error("Failed to load reviews");
        })
        .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      const savedReview = await reviewService.addReview({
        ...newReview,
        productId: id
      });

      setReviews([savedReview, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
      toast.success("Review posted successfully!");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error(error.response.data.message || "Failed to post review");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className="space-y-8 animate-pulse p-4 max-w-7xl mx-auto mt-6">
          <Skeleton className="h-8 w-64 rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Skeleton className="lg:col-span-5 h-[500px] w-full rounded-2xl" />
            <Skeleton className="lg:col-span-7 h-[500px] w-full rounded-2xl" />
          </div>
        </div>
    );
  }

  if (!product) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Product not found</h2>
          <p className="text-muted-foreground text-center max-w-md">
            The product you are looking for doesn't exist or has been removed from our catalog.
          </p>
          <Button asChild className="mt-4 rounded-full px-8">
            <Link to="/products">Browse All Products</Link>
          </Button>
        </div>
    );
  }

  const imageSrc = resolveProductImageUrl(product.imageUrl);
  const averageRating = reviews.length
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  // Calculate review distribution
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating as keyof typeof ratingCounts]++;
    }
  });

  return (
      <div className="space-y-10 max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 mt-6">

        {/* Sleek Breadcrumb Navigation */}
        <nav className="flex items-center text-sm font-medium text-muted-foreground mb-4">
          <Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4 mr-1" /> Products
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
          <span className="text-foreground capitalize">{product.category || "General"}</span>
          <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Image Area */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group overflow-hidden rounded-3xl border bg-background p-2 shadow-sm transition-all hover:shadow-md">
              {imageSrc ? (
                  <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                  />
              ) : (
                  <div className="w-full aspect-square bg-secondary/20 rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-20 w-20 mb-4 opacity-40" />
                    <span className="font-medium">No image available</span>
                  </div>
              )}
              {!product.available && (
                  <div className="absolute top-6 right-6 bg-destructive text-destructive-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    Out of Stock
                  </div>
              )}
            </div>
          </div>

          {/* Right Column: Details Area */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="mb-2">
            <span className="text-sm font-semibold tracking-wider text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
              {product.brand || "Generic Brand"}
            </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mt-4 mb-2 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-4 mb-6">
              <div className="flex items-center bg-secondary/40 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1.5" />
                <span className="font-bold text-foreground mr-1">{averageRating}</span>
                <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-green-500" /> Authentic Product
              </div>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-black">LKR {Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-b pb-8">
              {product.description || "Experience the best quality with this premium product, designed to meet your everyday needs with excellence."}
            </p>

            <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Product SKU</p>
                <p className="font-semibold text-foreground">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Availability</p>
                <p className="font-semibold text-foreground flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${product.totalQuantity && product.totalQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {product.totalQuantity ?? 0} Units globally
                </p>
              </div>
            </div>

            <Card className="shadow-none border-primary/20 bg-primary/5 overflow-hidden rounded-2xl">
              <CardHeader className="py-4 border-b border-primary/10 bg-primary/10">
                <CardTitle className="flex items-center gap-2 text-lg text-primary">
                  <Store className="h-5 w-5" /> Supermarket Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {product.inventories?.length ? (
                    <div className="divide-y divide-primary/10">
                      {product.inventories.map((inventory) => {
                        const market = supermarkets.find((item) => item.id === inventory.supermarketId);
                        return (
                            <div key={inventory.supermarketId} className="flex items-center justify-between p-4 hover:bg-primary/10 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shadow-sm">
                                  <Store className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-semibold text-foreground">{market?.name || inventory.supermarketId}</span>
                              </div>
                              <Badge variant="outline" className="bg-background font-bold px-3 py-1">
                                {inventory.quantity} in stock
                              </Badge>
                            </div>
                        );
                      })}
                    </div>
                ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Not currently available in any local supermarkets.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Dashboard Section */}
        <div className="pt-16 mt-8 border-t">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight">Customer Reviews</h2>
            <p className="text-muted-foreground mt-2">See what others are saying about this product.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column: Review Stats & List */}
            <div className="lg:col-span-8 space-y-8">

              {/* Visual Review Summary */}
              <Card className="border-none shadow-md bg-secondary/20 rounded-3xl overflow-hidden">
                <CardContent className="p-8 sm:flex items-center gap-10">
                  <div className="text-center sm:text-left mb-6 sm:mb-0 shrink-0">
                    <div className="text-6xl font-black text-foreground">{averageRating}</div>
                    <div className="flex text-yellow-500 my-2 justify-center sm:justify-start">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={20} fill={star <= Number(averageRating) ? "currentColor" : "none"} className={star <= Number(averageRating) ? "" : "text-muted-foreground/30"} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Based on {reviews.length} reviews</p>
                  </div>

                  <div className="flex-1 space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = ratingCounts[rating as keyof typeof ratingCounts];
                      const percentage = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                      return (
                          <div key={rating} className="flex items-center gap-3 text-sm">
                            <span className="font-medium w-2 text-muted-foreground">{rating}</span>
                            <Star className="h-4 w-4 fill-muted-foreground text-muted-foreground shrink-0" />
                            <div className="flex-1 h-2.5 bg-background rounded-full overflow-hidden border">
                              <div
                                  className="h-full bg-yellow-500 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-muted-foreground text-xs font-medium">{percentage}%</span>
                          </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Scrollable Review List */}
              <div className="space-y-5">
                <h3 className="text-xl font-bold">Recent Reviews</h3>
                {reviews.length > 0 ? (
                    <div className="space-y-5">
                      {reviews.map((r) => {
                        const initial = r.userId ? r.userId.charAt(0).toUpperCase() : "V";
                        return (
                            <Card key={r.id} className="shadow-sm border-border/50 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                      {initial}
                                    </div>
                                    <div>
                                      <p className="font-bold text-foreground">{r.userId || "Verified Customer"}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex text-yellow-500">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-muted-foreground/30"} />
                                          ))}
                                        </div>
                                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-sm flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Verified
                                  </span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-sm text-muted-foreground font-medium">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                            </span>
                                </div>
                                <p className="text-foreground/80 leading-relaxed sm:text-base text-sm ml-15">
                                  "{r.comment}"
                                </p>
                              </CardContent>
                            </Card>
                        );
                      })}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-3xl bg-secondary/10">
                      <div className="bg-background h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Star className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-bold">No reviews yet</h3>
                      <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Be the first to share your experience with this product to help other shoppers.</p>
                    </div>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Add Review Form */}
            <div className="lg:col-span-4 relative">
              <div className="sticky top-8">
                <Card className="shadow-xl border-border rounded-3xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary to-primary/50 w-full"></div>
                  <CardHeader className="bg-background pb-2">
                    <CardTitle className="text-2xl">Share Your Thoughts</CardTitle>
                    <CardDescription className="text-base mt-1">
                      How was your experience with this product?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 bg-secondary/10">
                    <form onSubmit={handleReviewSubmit} className="space-y-6">

                      {/* Interactive Star Rater */}
                      <div className="space-y-3 bg-background p-4 rounded-2xl border shadow-sm text-center">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Overall Rating</label>
                        <div className="flex items-center justify-center gap-2" onMouseLeave={() => setHoveredStar(null)}>
                          {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                  key={star}
                                  type="button"
                                  className="p-1 transition-all hover:scale-125 focus:outline-none"
                                  onMouseEnter={() => setHoveredStar(star)}
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                              >
                                <Star
                                    className={`h-9 w-9 transition-colors ${
                                        (hoveredStar !== null ? star <= hoveredStar : star <= newReview.rating)
                                            ? "fill-yellow-500 text-yellow-500"
                                            : "text-muted-foreground/20"
                                    }`}
                                />
                              </button>
                          ))}
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mt-2">
                          {newReview.rating === 5 && "Excellent!"}
                          {newReview.rating === 4 && "Good"}
                          {newReview.rating === 3 && "Average"}
                          {newReview.rating === 2 && "Poor"}
                          {newReview.rating === 1 && "Terrible"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold">Written Review</label>
                        <Textarea
                            placeholder="What did you like or dislike? Would you recommend it?"
                            value={newReview.comment}
                            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                            required
                            className="min-h-[140px] resize-none rounded-xl bg-background border shadow-sm focus-visible:ring-primary focus-visible:ring-offset-2"
                        />
                      </div>

                      <Button type="submit" className="w-full text-base h-12 rounded-xl font-bold" disabled={submitting}>
                        {submitting ? "Publishing Review..." : "Submit Review"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        By submitting, you agree to our review guidelines.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}