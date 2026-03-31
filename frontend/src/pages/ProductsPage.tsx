import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { productService, type Product } from "@/services/productService";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) => role.includes("ROLE_ADMIN"));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse all available products from our supermarkets.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, category or brand..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <Skeleton key={n} className="h-72 w-full" />
              ))}
            </div>
          ) : (
            <ProductGrid products={filteredProducts} emptyMessage="No matching products found." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
