import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productService, type Product } from "@/services/productService";
import { supermarketService, type Supermarket } from "@/services/supermarketService";
import { orderService } from "@/services/orderService";
import { resolveProductImageUrl } from "@/lib/productImage";
import { ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupermarketId, setSelectedSupermarketId] = useState("");
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);

  const loadProductData = () => {
    if (!id) return;

    // We load both resources so inventory rows can show supermarket names instead of raw IDs.
    Promise.allSettled([productService.getById(id), supermarketService.getAll()])
      .then(([productResult, marketResult]) => {
        if (productResult.status === "fulfilled") setProduct(productResult.value);
        else toast.error("Failed to load product details");

        if (marketResult.status === "fulfilled") setSupermarkets(marketResult.value);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProductData();
  }, [id]);

  useEffect(() => {
    // Lightweight polling keeps customer stock numbers fresh after concurrent orders.
    const intervalId = window.setInterval(loadProductData, 15000);
    return () => window.clearInterval(intervalId);
  }, [id]);

  const isAdmin = user?.roles?.some((role) => role.includes("ROLE_ADMIN"));
  const availableInventories = useMemo(
    () => (product?.inventories || []).filter((inventory) => inventory.quantity > 0),
    [product?.inventories]
  );
  const selectedInventory = availableInventories.find((inventory) => inventory.supermarketId === selectedSupermarketId);
  const maxAvailableForSelection = selectedInventory?.quantity || 0;
  const canOrder = !isAdmin && availableInventories.length > 0;

  useEffect(() => {
    if (!selectedSupermarketId && availableInventories.length > 0) {
      setSelectedSupermarketId(availableInventories[0].supermarketId);
    }
    if (!availableInventories.length) {
      setSelectedSupermarketId("");
      setOrderQuantity(1);
    }
  }, [availableInventories, selectedSupermarketId]);

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
  const stockStatus = product.stockStatus || (product.available ? "IN_STOCK" : "OUT_OF_STOCK");

  const placeOrder = async () => {
    if (!user?.id) {
      toast.error("Please login to place an order");
      return;
    }
    if (!selectedSupermarketId) {
      toast.error("Please select a supermarket");
      return;
    }
    if (orderQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (orderQuantity > maxAvailableForSelection) {
      toast.error(`Only ${maxAvailableForSelection} item(s) available in selected supermarket`);
      return;
    }

    setOrdering(true);
    try {
      // Direct product checkout uses the real productId + supermarketId so stock reductions are accurate.
      const createdOrder = await orderService.createOrder(user.id, "PREMIUM", {
        supermarketId: selectedSupermarketId,
        productId: product.id,
        isExpress: false,
        isDryClean: false,
        totalPrice: Number(product.price) * orderQuantity,
        items: [
          {
            productId: product.id,
            name: product.name,
            quantity: orderQuantity,
            unitPrice: Number(product.price),
          },
        ],
      });

      toast.success("Order placed successfully");
      loadProductData();
      navigate(`/orders/${createdOrder.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

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
              <Badge
                variant={
                  stockStatus === "LOW_STOCK"
                    ? "pending"
                    : stockStatus === "OUT_OF_STOCK"
                      ? "secondary"
                      : "default"
                }
              >
                {stockStatus === "LOW_STOCK"
                  ? "Low stock"
                  : stockStatus === "OUT_OF_STOCK"
                    ? "Out of stock"
                    : "In stock"}
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

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Order This Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {canOrder ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Select Supermarket</Label>
                    <Select value={selectedSupermarketId} onValueChange={setSelectedSupermarketId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supermarket" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInventories.map((inventory) => {
                          const market = supermarkets.find((item) => item.id === inventory.supermarketId);
                          return (
                            <SelectItem key={inventory.supermarketId} value={inventory.supermarketId}>
                              {(market?.name || inventory.supermarketId) + ` (Available: ${inventory.quantity})`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      max={maxAvailableForSelection || 1}
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Total: LKR {(Number(product.price) * orderQuantity).toFixed(2)}
                  </p>
                  <Button onClick={placeOrder} disabled={ordering || !selectedSupermarketId}>
                    {ordering ? "Placing order..." : "Place Order"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">This product is currently out of stock in all supermarkets.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
