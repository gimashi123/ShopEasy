import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import OrderItemsEditor, { type EditableOrderItem } from "@/components/orders/OrderItemsEditor";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/helpers";
import { orderService, type Order } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { productService, type Product } from "@/services/productService";
import type { Payment } from "@/types";

const makeLocalId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function UpdateOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [address, setAddress] = useState("");
  const [editableItems, setEditableItems] = useState<EditableOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.allSettled([orderService.getOrderById(id), paymentService.getByOrder(id), productService.getAll()])
      .then(([orderResult, paymentResult, productsResult]) => {
        if (orderResult.status === "fulfilled") {
          setOrder(orderResult.value);
        } else {
          toast.error("Failed to load order");
        }

        if (paymentResult.status === "fulfilled") {
          setPayment(paymentResult.value);
        }

        if (productsResult.status === "fulfilled") {
          setProducts(productsResult.value);
        } else {
          toast.error("Failed to load product list");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order) return;
    setAddress(order.address || "");
    setEditableItems(
      order.items.map((item) => ({
        ...item,
        localId: makeLocalId(),
      }))
    );
  }, [order]);

  const isAdmin = Boolean(user?.roles?.includes("ROLE_ADMIN"));
  const isOwner = Boolean(user?.id && order?.customerId && user.id === order.customerId);
  const hasAccess = isAdmin || isOwner;
  const isPending = order?.status === "PENDING";
  const paymentCompleted = payment?.status === "COMPLETED";
  const canEditItems = Boolean(isPending && !paymentCompleted);
  const canSave = Boolean(isPending && hasAccess);

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);

  const subtotal = useMemo(
    () => editableItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0),
    [editableItems]
  );
  const estimatedTotal = Math.max(subtotal + Number(order?.deliveryCharge || 0) - Number(order?.discountAmount || 0), 0);

  const onAddItem = () => {
    if (products.length === 0) return;
    const firstProduct = products[0];
    setEditableItems((prev) => [
      ...prev,
      {
        localId: makeLocalId(),
        id: firstProduct.id,
        productId: firstProduct.id,
        name: firstProduct.name,
        quantity: 1,
        unitPrice: Number(firstProduct.price || 0),
      },
    ]);
  };

  const onRemoveItem = (localId: string) => {
    setEditableItems((prev) => prev.filter((item) => item.localId !== localId));
  };

  const onProductChange = (localId: string, productId: string) => {
    const selected = productById.get(productId);
    if (!selected) return;

    setEditableItems((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              id: selected.id,
              productId: selected.id,
              name: selected.name,
              unitPrice: Number(selected.price || 0),
            }
          : item
      )
    );
  };

  const onQuantityChange = (localId: string, quantity: number) => {
    setEditableItems((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              quantity: Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1)),
            }
          : item
      )
    );
  };

  const onSave = async () => {
    if (!order || !canSave) return;
    if (!address.trim()) {
      toast.error("Delivery address is required");
      return;
    }
    if (canEditItems && editableItems.length === 0) {
      toast.error("At least one item is required");
      return;
    }

    setSaving(true);
    try {
      const updated = await orderService.updateOrder(order.id, {
        address: address.trim(),
        items: canEditItems
          ? editableItems.map((item) => ({
              id: item.productId || item.id,
              productId: item.productId || item.id,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }))
          : undefined,
      });
      setOrder(updated);
      toast.success(paymentCompleted ? "Address updated successfully" : "Order updated and totals recalculated");
      navigate(`/orders/${updated.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Order not found.</p>
        <Button variant="outline" asChild>
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">You are not allowed to update this order.</p>
        <Button variant="outline" asChild>
          <Link to={`/orders/${order.id}`}>Back to Order</Link>
        </Button>
      </div>
    );
  }

  if (!isPending) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Only pending orders can be updated.</p>
        <Button variant="outline" asChild>
          <Link to={`/orders/${order.id}`}>Back to Order</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/orders/${order.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Update Order</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={saving}
              placeholder="Enter delivery address"
            />
          </div>

          {!paymentCompleted ? (
            <OrderItemsEditor
              items={editableItems}
              products={products}
              disabled={saving}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
              onProductChange={onProductChange}
              onQuantityChange={onQuantityChange}
            />
          ) : (
            <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
              Payment is completed. Only the delivery address can be updated.
            </div>
          )}

          <div className="rounded-md border p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Charge</span>
              <span className="font-medium">{formatCurrency(Number(order.deliveryCharge || 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span className="font-medium">-{formatCurrency(Number(order.discountAmount || 0))}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-semibold">Estimated Total</span>
              <span className="font-semibold">{formatCurrency(estimatedTotal)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onSave} disabled={saving || !canSave} className="sm:flex-1">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {!paymentCompleted && (
              <Button variant="outline" asChild className="sm:flex-1">
                <Link to={`/payments/create?orderId=${order.id}`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
