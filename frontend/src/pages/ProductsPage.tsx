import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productService, type Product } from "@/services/productService";
import { resolveProductImageUrl } from "@/lib/productImage";
import { Search, Star, Package, ArrowRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductsPage() {
    const { user } = useAuth();
    const isAdmin = user?.roles?.some((role) => role.includes("ROLE_ADMIN"));

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Redirect Admins
    if (isAdmin) {
        return <Navigate to="/admin/products" replace />;
    }

    const loadProducts = () => {
        productService
            .getAll()
            .then(setProducts)
            .catch(() => toast.error("Failed to load products"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        // Poll product list so stock/availability cards reflect recent orders from any user.
        const intervalId = window.setInterval(loadProducts, 15000);
        return () => window.clearInterval(intervalId);
    }, []);

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return products;
        return products.filter((product) =>
            [product.name, product.sku, product.category, product.brand]
                .filter(Boolean)
                .some((field) => field!.toLowerCase().includes(query))
        );
    }, [products, search]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 mt-6">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-primary" />
                        Our Products
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
                        Discover our wide range of premium products available across all supermarkets.
                    </p>
                </div>

                {/* Modern Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, brand, or category..."
                        className="pl-11 h-14 rounded-2xl border-muted bg-secondary/20 focus-visible:ring-primary shadow-sm text-base"
                    />
                </div>
            </div>

            {/* Grid Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="space-y-4">
                            <Skeleton className="h-64 w-full rounded-3xl" />
                            <Skeleton className="h-6 w-3/4 rounded-md" />
                            <Skeleton className="h-4 w-1/2 rounded-md" />
                        </div>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-secondary/10 flex flex-col items-center">
                    <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-2xl font-bold">No products found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search terms or browse a different category.</p>
                    <Button onClick={() => setSearch("")} variant="outline" className="mt-6 rounded-full">
                        Clear Search
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map((product) => {
                        const imageSrc = resolveProductImageUrl(product.imageUrl);
                        const mockRating = 4.5;
                        const mockReviewCount = Math.floor(Math.random() * 50) + 5;

                        return (
                            <Card
                                key={product.id}
                                className="group border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden flex flex-col bg-background"
                            >
                                <div className="relative aspect-square overflow-hidden bg-secondary/20 p-4 flex items-center justify-center">
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt={product.name}
                                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <Package className="h-20 w-20 text-muted-foreground/30" />
                                    )}

                                    <div className="absolute top-4 left-4">
                                        <Badge variant={product.available ? "default" : "destructive"} className="shadow-md font-bold px-3 py-1">
                                            {product.available ? "In Stock" : "Out of Stock"}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 line-clamp-1">
                                        {product.brand || "Generic"} • {product.category || "General"}
                                    </div>

                                    <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                                        <Link to={`/products/${product.id}`} className="focus:outline-none">
                                            <span className="absolute inset-0 z-10" aria-hidden="true" />
                                            {product.name}
                                        </Link>
                                    </h3>

                                    {/* ⭐ Star Rating UI ⭐ */}
                                    <div className="flex items-center gap-1.5 mb-4 mt-auto">
                                        <div className="flex text-yellow-500">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    fill={star <= Math.floor(mockRating) ? "currentColor" : "none"}
                                                    className={star <= Math.floor(mockRating) ? "" : "text-muted-foreground/30"}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">({mockReviewCount})</span>
                                    </div>

                                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-border/50 relative z-20">
                                        <div>
                                            <span className="text-sm text-muted-foreground font-medium">Price</span>
                                            <p className="text-xl font-black text-foreground">
                                                LKR {Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>

                                        <Button
                                            size="icon"
                                            className="rounded-full h-10 w-10 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-none"
                                        >
                                            <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}