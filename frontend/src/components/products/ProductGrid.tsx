import type { Product } from "@/services/productService";
import { ProductCard } from "@/components/products/ProductCard";
import { PackageSearch } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage = "No products available right now." }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="text-center py-16">
        <PackageSearch className="h-9 w-9 mx-auto text-muted-foreground/40" />
        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
