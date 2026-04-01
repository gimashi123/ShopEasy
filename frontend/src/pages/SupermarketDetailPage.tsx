import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supermarketService, Supermarket } from "@/services/supermarketService";
import { productService, Product } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, MapPin, Phone, Mail, Clock, Store,
  Trash2, Pencil, ExternalLink, Search, Package,
  ShoppingCart, Tag, Star, ArrowRight
} from "lucide-react";
import { resolveProductImageUrl, resolveGoogleDriveUrl } from "@/lib/productImage";
import { toast } from "sonner";
import { formatDate } from "@/lib/helpers";

// ─── stock helpers ───────────────────────────────────────────────────────────

function getStockForSupermarket(product: Product, supermarketId: string): number {
  const inv = product.inventories?.find(i => i.supermarketId === supermarketId);
  return inv?.quantity ?? 0;
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <Badge variant="destructive" className="shadow-md font-bold px-3 py-1">Out of Stock</Badge>;
  if (qty <= 10) return <Badge variant="outline" className="shadow-md font-bold px-3 py-1 text-amber-600 border-amber-300 bg-amber-50">Low Stock · {qty}</Badge>;
  return <Badge variant="default" className="shadow-md font-bold px-3 py-1">In Stock</Badge>;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function SupermarketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => r.includes("ROLE_ADMIN"));

  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingSupermarket, setLoadingSupermarket] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    supermarketService.getById(id)
      .then(setSupermarket)
      .catch(() => toast.error("Failed to load supermarket"))
      .finally(() => setLoadingSupermarket(false));

    productService.getBySupermarketId(id)
      .then(setProducts)
      .catch(() => toast.error("Failed to load products — is the product service running?"))
      .finally(() => setLoadingProducts(false));
  }, [id]);

  const categories = ["ALL", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchSearch = !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase());
    const matchCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleDelete = async () => {
    if (!supermarket) return;
    setDeleting(true);
    try {
      await supermarketService.delete(supermarket.id);
      toast.success("Supermarket deleted successfully");
      navigate("/supermarkets");
    } catch {
      toast.error("Failed to delete supermarket");
    } finally {
      setDeleting(false);
    }
  };

  if (loadingSupermarket) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!supermarket) {
    return (
      <div className="text-center py-20">
        <Store className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-2 text-sm font-medium">Supermarket not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/supermarkets">Back to Supermarkets</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">

        {/* ── Hero Banner ───────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-md relative text-white"
          style={supermarket.imageUrl ? undefined : undefined}>
          {/* Background: image or gradient */}
          {supermarket.imageUrl ? (
            <div className="absolute inset-0">
              <img src={resolveGoogleDriveUrl(supermarket.imageUrl)} alt={supermarket.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary" />
          )}
          <div className="relative p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20 mt-0.5 shrink-0">
                <Link to="/supermarkets"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
              </Button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{supermarket.name}</h1>
                  <Badge className={`text-[10px] ${supermarket.active ? "bg-green-400/30 text-white border-green-300" : "bg-white/20 text-white"}`}>
                    {supermarket.active ? "Open" : "Closed"}
                  </Badge>
                </div>
                <p className="text-white/70 text-xs mt-0.5">{supermarket.id}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  {supermarket.address && (
                    <span className="flex items-center gap-1.5 text-sm text-white/80">
                      <MapPin className="h-3.5 w-3.5" />{supermarket.address}
                    </span>
                  )}
                  {supermarket.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-white/80">
                      <Phone className="h-3.5 w-3.5" />{supermarket.phone}
                    </span>
                  )}
                  {supermarket.email && (
                    <span className="flex items-center gap-1.5 text-sm text-white/80">
                      <Mail className="h-3.5 w-3.5" />{supermarket.email}
                    </span>
                  )}
                  {supermarket.openingHours && (
                    <span className="flex items-center gap-1.5 text-sm text-white/80">
                      <Clock className="h-3.5 w-3.5" />{supermarket.openingHours}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {supermarket.mapLink && (
                <Button asChild size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <a href={supermarket.mapLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />Map
                  </a>
                </Button>
              )}
              {isAdmin && (
                <>
                  <Button asChild size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Link to={`/supermarkets/${supermarket.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-1" />Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-300 hover:bg-white/20 hover:text-red-200" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />Delete
                  </Button>
                </>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* ── Info Cards Row ────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: "Total Products", value: loadingProducts ? "…" : products.length.toString() },
            { icon: ShoppingCart, label: "In Stock", value: loadingProducts ? "…" : products.filter(p => getStockForSupermarket(p, id!) > 0).length.toString() },
            { icon: Tag, label: "Categories", value: loadingProducts ? "…" : (categories.length - 1).toString() },
            { icon: Clock, label: "Added On", value: formatDate(supermarket.createdAt) },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="border shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Products Section ──────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">Available Products</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input hover:bg-muted"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-3xl" />
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-secondary/10 flex flex-col items-center">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-2xl font-bold">No products found</h3>
              <p className="text-muted-foreground mt-2">
                {productSearch ? "Try a different search term" : "This supermarket has no products listed yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map(product => {
                const qty = getStockForSupermarket(product, id!);
                const imageSrc = resolveProductImageUrl(product.imageUrl);
                const mockRating = 4.5;
                const mockReviewCount = Math.floor(Math.random() * 50) + 5;
                return (
                  <Card key={product.id}
                    className="relative group border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden flex flex-col bg-background">

                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-secondary/20 p-4 flex items-center justify-center">
                      {imageSrc ? (
                        <img src={imageSrc} alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <Package className="h-20 w-20 text-muted-foreground/30" />
                      )}
                      <div className="absolute top-4 left-4">
                        <StockBadge qty={qty} />
                      </div>
                    </div>

                    {/* Product Info */}
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

                      <div className="flex items-center gap-1.5 mb-4 mt-auto">
                        <div className="flex text-yellow-500">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} size={14}
                              fill={star <= Math.floor(mockRating) ? "currentColor" : "none"}
                              className={star <= Math.floor(mockRating) ? "" : "text-muted-foreground/30"} />
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
                        <Button size="icon"
                          className="rounded-full h-10 w-10 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-none">
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
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supermarket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{supermarket.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
