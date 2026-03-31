import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productService, type Product } from "@/services/productService";
import { supermarketService, type Supermarket } from "@/services/supermarketService";
import { reviewService, type Review } from "@/services/reviewService";
import { resolveProductImageUrl } from "@/lib/productImage";
import { ArrowLeft, Package, Star, Store, CheckCircle, ShieldCheck, ChevronRight, ShoppingCart, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductDetailPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // Data State
    const [product, setProduct] = useState<Product | null>(null);
    const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Order State
    const [selectedSupermarketId, setSelectedSupermarketId] = useState("");
    const [orderQuantity, setOrderQuantity] = useState(1);

    // Add Review State
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [submitting, setSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    // Edit Review State
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editReviewData, setEditReviewData] = useState({ rating: 5, comment: "" });
    const [editHoveredStar, setEditHoveredStar] = useState<number | null>(null);
    const [updating, setUpdating] = useState(false);

    // --- DATA LOADING & POLLING ---
    const loadProductData = () => {
        if (!id) return;

        Promise.allSettled([
            productService.getById(id),
            supermarketService.getAll(),
            reviewService.getByProductId(id)
        ])
            .then(([productResult, marketResult, reviewResult]) => {
                if (productResult.status === "fulfilled") setProduct(productResult.value);
                else if (!product) toast.error("Failed to load product details");

                if (marketResult.status === "fulfilled") setSupermarkets(marketResult.value);

                if (reviewResult.status === "fulfilled") setReviews(reviewResult.value);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProductData();
    }, [id]);

    useEffect(() => {
        const intervalId = window.setInterval(loadProductData, 15000);
        return () => window.clearInterval(intervalId);
    }, [id]);

    // --- ORDERING LOGIC ---
    const isAdmin = user?.roles?.some((role) => role.includes("ROLE_ADMIN"));
    const availableInventories = useMemo(
        () => (product?.inventories || []).filter((inventory) => inventory.quantity > 0),
        [product?.inventories]
    );

    const selectedInventory = availableInventories.find((inventory) => inventory.supermarketId === selectedSupermarketId);
    const maxAvailableForSelection = selectedInventory?.quantity || 0;
    const canOrder = !isAdmin && availableInventories.length > 0;

    useEffect(() => {
        if (!selectedSupermarketId && availableInventories.length > 0) {
            setSelectedSupermarketId(availableInventories[0].supermarketId);
        }
        if (!availableInventories.length) {
            setSelectedSupermarketId("");
            setOrderQuantity(1);
        }
    }, [availableInventories, selectedSupermarketId]);

    const placeOrder = () => {
        if (!user?.id) return toast.error("Please login to place an order");
        if (!selectedSupermarketId) return toast.error("Please select a supermarket");
        if (orderQuantity < 1) return toast.error("Quantity must be at least 1");
        if (orderQuantity > maxAvailableForSelection) return toast.error(`Only ${maxAvailableForSelection} item(s) available.`);

        navigate("/orders/create", {
            state: {
                source: "product-detail",
                supermarketId: selectedSupermarketId,
                prefilledItems: [
                    {
                        productId: product!.id,
                        name: product!.name,
                        quantity: orderQuantity,
                        unitPrice: Number(product!.price),
                    },
                ],
            },
        });
    };

    // --- REVIEW SUBMISSION LOGIC ---
    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setSubmitting(true);
        try {
            const savedReview = await reviewService.addReview({ ...newReview, productId: id });
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

    // --- REVIEW EDIT/DELETE LOGIC ---
    const startEditing = (review: Review) => {
        setEditingReviewId(review.id);
        setEditReviewData({ rating: review.rating, comment: review.comment });
    };

    const handleUpdateReview = async (e: React.FormEvent, reviewId: string) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const updatedReview = await reviewService.updateReview(reviewId, {
                ...editReviewData,
                productId: id!
            });
            setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
            setEditingReviewId(null);
            toast.success("Review updated successfully!");
        } catch (error) {
            toast.error("Failed to update review.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            await reviewService.deleteReview(reviewId);
            setReviews(reviews.filter(r => r.id !== reviewId));
            toast.success("Review deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete review.");
        }
    };


    // --- UI RENDERERS ---
    if (loading && !product) {
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
                <Button asChild className="mt-4 rounded-full px-8">
                    <Link to="/products">Browse All Products</Link>
                </Button>
            </div>
        );
    }

    const imageSrc = resolveProductImageUrl(product.imageUrl);
    const stockStatus = product.stockStatus || (product.available ? "IN_STOCK" : "OUT_OF_STOCK");

    const averageRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating as keyof typeof ratingCounts]++;
    });

    // Current Logged-in Username (using username or id based on your token setup)
    const currentUserId = user?.username || user?.id;

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 mt-6">

            {/* Breadcrumb Navigation */}
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
                        <div className="absolute top-6 right-6">
                            <Badge
                                className="px-4 py-1.5 rounded-full text-sm font-bold shadow-lg"
                                variant={stockStatus === "LOW_STOCK" ? "pending" : stockStatus === "OUT_OF_STOCK" ? "destructive" : "default"}
                            >
                                {stockStatus === "LOW_STOCK" ? "Low Stock" : stockStatus === "OUT_OF_STOCK" ? "Out of Stock" : "In Stock"}
                            </Badge>
                        </div>
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

                    {/* Main Branch Order Placement Card */}
                    {!isAdmin && (
                        <Card className="shadow-md border-border rounded-2xl overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-primary/80 to-primary"></div>
                            <CardHeader className="bg-background pb-4">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" /> Order This Product
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {canOrder ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label className="font-bold text-muted-foreground">Select Supermarket</Label>
                                                <Select value={selectedSupermarketId} onValueChange={setSelectedSupermarketId}>
                                                    <SelectTrigger className="h-12 rounded-xl border-muted bg-secondary/10">
                                                        <SelectValue placeholder="Select supermarket" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableInventories.map((inventory) => {
                                                            const market = supermarkets.find((item) => item.id === inventory.supermarketId);
                                                            return (
                                                                <SelectItem key={inventory.supermarketId} value={inventory.supermarketId}>
                                                                    {(market?.name || inventory.supermarketId) + ` (${inventory.quantity} available)`}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="font-bold text-muted-foreground">Quantity</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max={maxAvailableForSelection || 1}
                                                    value={orderQuantity}
                                                    onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value) || 1))}
                                                    className="h-12 rounded-xl border-muted bg-secondary/10 text-lg font-semibold"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                                <p className="text-2xl font-black text-foreground">
                                                    LKR {(Number(product.price) * orderQuantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <Button onClick={placeOrder} disabled={!selectedSupermarketId} className="h-12 px-8 rounded-xl font-bold text-base w-full sm:w-auto">
                                                Checkout Now
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-4 text-center border border-dashed rounded-xl bg-secondary/20">
                                        <p className="text-muted-foreground font-medium">This product is currently out of stock everywhere.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
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
                                                    <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
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
                                        const isOwner = currentUserId === r.userId;
                                        const isEditingThis = editingReviewId === r.id;

                                        return (
                                            <Card key={r.id} className={`shadow-sm border-border/50 rounded-2xl overflow-hidden transition-shadow ${isOwner ? 'border-primary/20 bg-primary/5' : 'hover:shadow-md'}`}>
                                                <CardContent className="p-6">

                                                    {/* Review Header */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                                                {r.userId ? r.userId.charAt(0).toUpperCase() : "V"}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-foreground">
                                                                    {r.userId || "Verified Customer"}
                                                                    {isOwner && <span className="ml-2 text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">You</span>}
                                                                </p>
                                                                {!isEditingThis && (
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
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons (Edit/Delete) */}
                                                        <div className="flex items-center gap-2">
                                                            {!isEditingThis && (
                                                                <span className="text-sm text-muted-foreground font-medium hidden sm:block">
                                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                                </span>
                                                            )}
                                                            {isOwner && !isEditingThis && (
                                                                <div className="flex gap-1 bg-background rounded-lg border shadow-sm p-0.5">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEditing(r)}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteReview(r.id)}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Review Body (Edit Form OR Text) */}
                                                    {isEditingThis ? (
                                                        <form onSubmit={(e) => handleUpdateReview(e, r.id)} className="space-y-4 mt-2 bg-background p-4 rounded-xl border shadow-inner">
                                                            <div className="flex items-center justify-between border-b pb-3">
                                                                <label className="text-sm font-bold text-muted-foreground uppercase">Update Rating</label>
                                                                <div className="flex gap-1" onMouseLeave={() => setEditHoveredStar(null)}>
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <button
                                                                            key={star}
                                                                            type="button"
                                                                            className="focus:outline-none hover:scale-110 transition-transform"
                                                                            onMouseEnter={() => setEditHoveredStar(star)}
                                                                            onClick={() => setEditReviewData({ ...editReviewData, rating: star })}
                                                                        >
                                                                            <Star
                                                                                className={`h-6 w-6 transition-colors ${(editHoveredStar !== null ? star <= editHoveredStar : star <= editReviewData.rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/20"}`}
                                                                            />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <Textarea
                                                                value={editReviewData.comment}
                                                                onChange={(e) => setEditReviewData({...editReviewData, comment: e.target.value})}
                                                                required
                                                                className="min-h-[100px] resize-none"
                                                            />
                                                            <div className="flex gap-2 justify-end">
                                                                <Button type="button" variant="outline" onClick={() => setEditingReviewId(null)}>Cancel</Button>
                                                                <Button type="submit" disabled={updating}>{updating ? "Saving..." : "Save Changes"}</Button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <p className="text-foreground/80 leading-relaxed sm:text-base text-sm ml-15">
                                                            "{r.comment}"
                                                        </p>
                                                    )}
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