import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFormDialog, type ProductFormState } from "@/components/products/ProductFormDialog";
import { productService, type Product } from "@/services/productService";
import { supermarketService, type Supermarket } from "@/services/supermarketService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) => role.includes("ROLE_ADMIN"));

  const [product, setProduct] = useState<Product | null>(null);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ProductFormState>({
    sku: "",
    name: "",
    description: "",
    category: "",
    brand: "",
    imageUrl: "",
    price: 0,
    inventories: [{ supermarketId: "", quantity: 0 }],
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    const [productResult, marketResult] = await Promise.allSettled([
      productService.getById(id),
      supermarketService.getAll(),
    ]);

    if (productResult.status === "fulfilled") {
      setProduct(productResult.value);
    } else {
      toast.error("Failed to load product");
      setProduct(null);
    }

    if (marketResult.status === "fulfilled") {
      setSupermarkets(marketResult.value);
    } else {
      setSupermarkets([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadProduct();
    }
  }, [id, isAdmin]);

  const openEdit = () => {
    if (!product) return;
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

  const handleUpdate = async () => {
    if (!id || !validate()) return;

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
      const updated = await productService.update(id, payload);
      setProduct(updated);
      setDialogOpen(false);
      toast.success("Product updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await productService.delete(id);
      toast.success("Product deleted successfully");
      navigate("/admin/products");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Button asChild variant="outline">
          <Link to="/admin/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <Badge variant={product.available ? "default" : "secondary"}>
              {product.available ? "Available" : "Out of stock"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEdit}>
              <Pencil className="mr-1.5 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-52 object-cover rounded-md border"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No image available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory By Supermarket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {product.inventories?.length ? (
              product.inventories.map((item) => {
                const market = supermarkets.find((m) => m.id === item.supermarketId);
                return (
                  <div key={item.supermarketId} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                    <span>{market?.name || item.supermarketId}</span>
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No inventory records.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Edit Product"
        saving={saving}
        form={form}
        supermarkets={supermarkets}
        errors={errors}
        onFormChange={setForm}
        onSave={handleUpdate}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
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
    </>
  );
}
