import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFormDialog, type ProductFormState } from "@/components/products/ProductFormDialog";
import { ProductsTable } from "@/components/products/ProductsTable";
import { PromotionFormDialog } from "@/components/promotions/PromotionFormDialog";
import { productService, type Product } from "@/services/productService";
import { supermarketService, type Supermarket } from "@/services/supermarketService";
import { Plus, Search, Store } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM: ProductFormState = {
  sku: "",
  name: "",
  description: "",
  category: "",
  brand: "",
  imageUrl: "",
  price: 0,
  inventories: [{ supermarketId: "", quantity: 0 }],
};

export default function AdminProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.some((role) => role.includes("ROLE_ADMIN"));

  const [products, setProducts] = useState<Product[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [promotingProduct, setPromotingProduct] = useState<Product | null>(null);

  const loadData = async () => {
    setLoading(true);
    // Keep product listing resilient: a supermarket API failure should not hide products.
    const [productsResult, supermarketsResult] = await Promise.allSettled([
      productService.getAll(),
      supermarketService.getAll(),
    ]);

    if (productsResult.status === "fulfilled") {
      setProducts(productsResult.value);
    } else {
      setProducts([]);
      toast.error("Failed to load products");
    }

    if (supermarketsResult.status === "fulfilled") {
      setSupermarkets(supermarketsResult.value);
    } else {
      setSupermarkets([]);
      toast.error("Failed to load supermarkets for inventory options");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.sku, product.category, product.brand]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query))
    );
  }, [products, search]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      brand: product.brand || "",
      imageUrl: product.imageUrl || "",
      price: Number(product.price),
      inventories: product.inventories?.length
        ? product.inventories.map((item) => ({
            supermarketId: item.supermarketId,
            quantity: item.quantity,
          }))
        : [{ supermarketId: "", quantity: 0 }],
    });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.sku.trim()) nextErrors.sku = "SKU is required";
    if (!form.name.trim()) nextErrors.name = "Product name is required";
    if (form.price <= 0) nextErrors.price = "Price must be greater than 0";

    const invalidInventory = form.inventories.some(
      (item) => !item.supermarketId || item.quantity < 0 || Number.isNaN(item.quantity)
    );
    if (!form.inventories.length || invalidInventory) {
      nextErrors.inventories = "Each inventory row needs a supermarket and quantity 0 or more";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload: ProductFormState = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      category: form.category?.trim() || undefined,
      brand: form.brand?.trim() || undefined,
      imageUrl: form.imageUrl?.trim() || undefined,
      price: Number(form.price),
      inventories: form.inventories.map((item) => ({
        supermarketId: item.supermarketId,
        quantity: Number(item.quantity),
      })),
    };

    setSaving(true);
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        toast.success("Product updated successfully");
      } else {
        await productService.create(payload);
        toast.success("Product created successfully");
      }
      setDialogOpen(false);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productService.delete(deleteTarget.id);
      toast.success("Product deleted successfully");
      setDeleteTarget(null);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handlePromote = (product: Product) => {
    setPromotingProduct(product);
    setPromotionDialogOpen(true);
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage product catalog and supermarket-level inventory.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, category or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-12 w-full" />)}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Store className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium text-foreground">No products found</p>
                <p className="text-sm text-muted-foreground">
                  {search ? "Try changing your search text" : "Start by creating your first product"}
                </p>
              </div>
            ) : (
              <ProductsTable
                products={filteredProducts}
                onView={(product) => navigate(`/admin/products/${product.id}`)}
                onEdit={openEdit}
                onDelete={(product) => setDeleteTarget(product)}
                onPromote={handlePromote}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingProduct ? "Edit Product" : "Add Product"}
        saving={saving}
        form={form}
        supermarkets={supermarkets}
        errors={errors}
        onFormChange={setForm}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PromotionFormDialog
        open={promotionDialogOpen}
        onOpenChange={setPromotionDialogOpen}
        product={promotingProduct}
      />
    </>
  );
}
