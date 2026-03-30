import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { ProductRequest } from "@/services/productService";
import type { Supermarket } from "@/services/supermarketService";

export interface ProductFormState extends ProductRequest {}

interface ProductFormDialogProps {
  open: boolean;
  title: string;
  saving: boolean;
  form: ProductFormState;
  supermarkets: Supermarket[];
  errors: Record<string, string>;
  imageFile: File | null;
  onOpenChange: (open: boolean) => void;
  onFormChange: (next: ProductFormState) => void;
  onImageFileChange: (file: File | null) => void;
  onSave: () => void;
}

export function ProductFormDialog({
  open,
  title,
  saving,
  form,
  supermarkets,
  errors,
  imageFile,
  onOpenChange,
  onFormChange,
  onImageFileChange,
  onSave,
}: ProductFormDialogProps) {
  const setField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    onFormChange({ ...form, [key]: value });
  };

  const updateInventory = (index: number, key: "supermarketId" | "quantity", value: string) => {
    const next = [...form.inventories];
    next[index] = {
      ...next[index],
      [key]: key === "quantity" ? Number(value) || 0 : value,
    };
    onFormChange({ ...form, inventories: next });
  };

  const addInventory = () => {
    onFormChange({
      ...form,
      inventories: [...form.inventories, { supermarketId: "", quantity: 0 }],
    });
  };

  const removeInventory = (index: number) => {
    const next = form.inventories.filter((_, i) => i !== index);
    onFormChange({ ...form, inventories: next });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Basic product fields are grouped here to keep the form easy to scan. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>SKU *</Label>
              <Input
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value)}
                placeholder="SKU-001"
              />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Apple Juice 1L"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                value={form.category || ""}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="Beverages"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Input
                value={form.brand || ""}
                onChange={(e) => setField("brand", e.target.value)}
                placeholder="Coca-Cola"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Price (LKR) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setField("price", Number(e.target.value))}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
          <div className="space-y-1.5">
            <Label>Image URL</Label>
            <Input
              value={form.imageUrl || ""}
              onChange={(e) => setField("imageUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Upload Image From Device</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onImageFileChange(e.target.files?.[0] || null)}
            />
            {imageFile && (
              <p className="text-xs text-muted-foreground">Selected file: {imageFile.name}</p>
            )}
          </div>
        </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description || ""}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Short product description..."
              rows={3}
            />
          </div>

          {/* Inventory rows let admins assign stock per supermarket in one place. */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Inventories *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addInventory}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Inventory Row
              </Button>
            </div>

            {form.inventories.map((inventory, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_120px_48px] gap-3">
                <Select
                  value={inventory.supermarketId}
                  onValueChange={(value) => updateInventory(index, "supermarketId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supermarket" />
                  </SelectTrigger>
                  <SelectContent>
                    {supermarkets.map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  value={inventory.quantity}
                  onChange={(e) => updateInventory(index, "quantity", e.target.value)}
                  placeholder="Qty"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeInventory(index)}
                  disabled={form.inventories.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {errors.inventories && <p className="text-xs text-destructive">{errors.inventories}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
