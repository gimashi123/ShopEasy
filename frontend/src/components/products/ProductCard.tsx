import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/services/productService";
import { resolveProductImageUrl } from "@/lib/productImage";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageSrc = resolveProductImageUrl(product.imageUrl);
  const status = product.stockStatus || (product.available ? "IN_STOCK" : "OUT_OF_STOCK");
  const statusLabel =
    status === "LOW_STOCK" ? "Low Stock" : status === "OUT_OF_STOCK" ? "Out of stock" : "In Stock";
  const badgeVariant = status === "OUT_OF_STOCK" ? "secondary" : status === "LOW_STOCK" ? "pending" : "default";

  return (
    <Link to={`/products/${product.id}`} className="block">
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div className="h-44 bg-muted flex items-center justify-center">
          {imageSrc ? (
            <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <Package className="h-7 w-7" />
              <span className="text-xs mt-1">No image</span>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{product.name}</h3>
            <Badge variant={badgeVariant}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {product.description || "No description available."}
          </p>
          <p className="text-base font-bold">LKR {Number(product.price).toFixed(2)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
