import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrderItem } from "@/services/orderService";
import type { Product } from "@/services/productService";

export interface EditableOrderItem extends OrderItem {
  localId: string;
}

interface OrderItemsEditorProps {
  items: EditableOrderItem[];
  products: Product[];
  disabled?: boolean;
  onAddItem: () => void;
  onRemoveItem: (localId: string) => void;
  onProductChange: (localId: string, productId: string) => void;
  onQuantityChange: (localId: string, quantity: number) => void;
}

export default function OrderItemsEditor({
  items,
  products,
  disabled,
  onAddItem,
  onRemoveItem,
  onProductChange,
  onQuantityChange,
}: OrderItemsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Order Items</h3>
        <Button type="button" variant="outline" onClick={onAddItem} disabled={disabled}>
          Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.localId} className="grid grid-cols-1 md:grid-cols-12 gap-3 border rounded-lg p-3">
            <div className="md:col-span-6 space-y-2">
              <Label>Product</Label>
              <Select
                value={item.productId || item.id || ""}
                onValueChange={(value) => onProductChange(item.localId, value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Qty</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.localId, Number(e.target.value))}
                disabled={disabled}
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Unit Price</Label>
              <Input value={Number(item.unitPrice || 0).toFixed(2)} disabled />
            </div>

            <div className="md:col-span-1 flex items-end">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => onRemoveItem(item.localId)}
                disabled={disabled || items.length <= 1}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
