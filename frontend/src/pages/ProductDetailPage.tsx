import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { productService, type Product } from "@/services/productService";
import { supermarketService, type Supermarket } from "@/services/supermarketService";
import { resolveProductImageUrl } from "@/lib/productImage";
import { ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // We load both resources so inventory rows can show supermarket names instead of raw IDs.
    Promise.allSettled([productService.getById(id), supermarketService.getAll()])
      .then(([productResult, marketResult]) => {
        if (productResult.status === "fulfilled") setProduct(productResult.value);
        else toast.error("Failed to load product details");

        if (marketResult.status === "fulfilled") setSupermarkets(marketResult.value);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Button asChild variant="outline">
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const imageSrc = resolveProductImageUrl(product.imageUrl);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to="/products">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
          </CardHeader>
          <CardContent>
            {imageSrc ? (
              <img src={imageSrc} alt={product.name} className="w-full h-80 object-cover rounded-md border" />
            ) : (
              <div className="h-80 rounded-md border flex flex-col items-center justify-center text-muted-foreground">
                <Package className="h-8 w-8" />
                <span className="text-sm mt-2">No image available</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">SKU:</span> {product.sku}</p>
            <p><span className="font-medium">Category:</span> {product.category || "-"}</p>
            <p><span className="font-medium">Brand:</span> {product.brand || "-"}</p>
            <p><span className="font-medium">Price:</span> LKR {Number(product.price).toFixed(2)}</p>
            <p><span className="font-medium">Total Stock:</span> {product.totalQuantity ?? 0}</p>
            <p><span className="font-medium">Description:</span> {product.description || "-"}</p>
            <div>
              <Badge variant={product.available ? "default" : "secondary"}>
                {product.available ? "Available" : "Out of stock"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Availability By Supermarket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {product.inventories?.length ? (
            product.inventories.map((inventory) => {
              const market = supermarkets.find((item) => item.id === inventory.supermarketId);
              return (
                <div
                  key={inventory.supermarketId}
                  className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
                >
                  <span>{market?.name || inventory.supermarketId}</span>
                  <span className="font-medium">{inventory.quantity}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No inventory information available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
