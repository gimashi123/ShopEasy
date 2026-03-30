import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product } from "@/services/productService";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface ProductsTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, onView, onEdit, onDelete }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
              <TableCell>{product.category || "-"}</TableCell>
              <TableCell className="text-right">LKR {Number(product.price).toFixed(2)}</TableCell>
              <TableCell className="text-right">{product.totalQuantity ?? 0}</TableCell>
              <TableCell>
                <Badge variant={product.available ? "default" : "secondary"}>
                  {product.available ? "Available" : "Out of stock"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onView(product)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(product)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
