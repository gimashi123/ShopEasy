import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { orderService, OrderItem } from "@/services/orderService";
import { loyaltyService, LoyaltyAccount } from "@/services/loyaltyService";
import { productService } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/helpers";

type CreateOrderNavigationState = {
  source?: string;
  supermarketId?: string;
  prefilledItems?: Array<{
    productId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
};

type CatalogueProduct = {
  id: string;
  name: string;
  price: number;
};

const PROMOTION_DISCOUNT_AMOUNT = 5.0;
const DEFAULT_DELIVERY_CHARGE_AMOUNT = 3.0;

export default function CreateOrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initializedFromNavigation = useRef(false);

  const [serviceType, setServiceType] = useState<'STANDARD' | 'PREMIUM'>("STANDARD");
  const [itemCount, setItemCount] = useState<number>(5); // 5 items default for standard bag
  const [cartItems, setCartItems] = useState<Omit<OrderItem, 'id'>[]>([]);
  const [selectedSupermarketId, setSelectedSupermarketId] = useState<string | undefined>(undefined);
  const [defaultProductId, setDefaultProductId] = useState<string | undefined>(undefined);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [prefilledFromProduct, setPrefilledFromProduct] = useState(false);
  const [isExpress, setIsExpress] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);

  const discountPercentage = (() => {
    switch (loyaltyAccount?.tier) {
      case "SILVER": return 0.05;
      case "GOLD": return 0.10;
      case "PLATINUM": return 0.15;
      default: return 0;
    }
  })();
  const discountedPrice = calculatedPrice * (1 - discountPercentage);
  const promotionDiscount = calculatedPrice > 0 ? PROMOTION_DISCOUNT_AMOUNT : 0;
  const deliveryCharge = calculatedPrice > 0 ? DEFAULT_DELIVERY_CHARGE_AMOUNT : 0;
  const finalPayablePrice = Math.max(0, discountedPrice - promotionDiscount) + deliveryCharge;
  const premiumItemsSubtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const getItemPromotionDiscount = (itemTotal: number) => {
    if (promotionDiscount <= 0 || premiumItemsSubtotal <= 0) return 0;
    return Number(((promotionDiscount * itemTotal) / premiumItemsSubtotal).toFixed(2));
  };

  const [processing, setProcessing] = useState(false);

  const [rules, setRules] = useState<Record<string, number>>({});
  const [premiumCatalogue, setPremiumCatalogue] = useState<CatalogueProduct[]>([]);
  const [catalogueLoading, setCatalogueLoading] = useState(false);

  useEffect(() => {
    orderService.getPricingRules().then(setRules).catch(console.error);
    if (user?.id) {
      loyaltyService.getAccount(user.id).then(setLoyaltyAccount).catch(console.error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (initializedFromNavigation.current) return;
    initializedFromNavigation.current = true;

    const navState = location.state as CreateOrderNavigationState | null;
    if (navState?.source !== "product-detail" || !navState.prefilledItems?.length) return;

    setServiceType("PREMIUM");
    setCartItems(
      navState.prefilledItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: Math.max(1, item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
      }))
    );
    setSelectedSupermarketId(navState.supermarketId);
    setPrefilledFromProduct(true);
  }, [location.state]);

  useEffect(() => {
    setCatalogueLoading(true);
    productService
      .getAll()
      .then((products) => {
        const catalogue = products
          .filter((product) => product.available && (product.totalQuantity || 0) > 0)
          .map((product) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price || 0),
          }));
        setPremiumCatalogue(catalogue);

        const firstStockedProduct = products.find((product) =>
          (product.inventories || []).some((inventory) => inventory.quantity > 0)
        );
        const firstStockedInventory = firstStockedProduct?.inventories?.find((inventory) => inventory.quantity > 0);

        if (firstStockedProduct?.id) {
          setDefaultProductId((prev) => prev || firstStockedProduct.id);
        }
        if (firstStockedInventory?.supermarketId) {
          setSelectedSupermarketId((prev) => prev || firstStockedInventory.supermarketId);
        }
      })
      .catch(() => {
        toast.error("Failed to load products");
      })
      .finally(() => setCatalogueLoading(false));
  }, []);

  useEffect(() => {
    orderService.calculatePrice(serviceType, {
      weight: itemCount, // Map itemCount to weight for backend compatibility
      items: cartItems,
      isExpress,
      isDryClean: isPriority // Map isPriority to isDryClean for backend compatibility
    }, rules).then(setCalculatedPrice);
  }, [cartItems, serviceType, itemCount, isExpress, isPriority, rules]);

  // Rest of the logic remains the same, just updating labels in return...

  const addToCart = (product: CatalogueProduct) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, unitPrice: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (name: string) => {
    setCartItems(prev => prev.filter(i => i.name !== name));
  };

  const submitOrder = async () => {
    if (!user?.id) return;
    if (serviceType === "PREMIUM" && cartItems.length === 0) {
      toast.error("Add at least one item to place an order");
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    setProcessing(true);
    try {
      const firstItemProductId = cartItems[0]?.productId || defaultProductId;
      const order = await orderService.createOrder(user.id, serviceType, {
        weight: itemCount,
        items: cartItems,
        isExpress,
        isDryClean: isPriority,
        totalPrice: finalPayablePrice,
        deliveryCharge,
        address: deliveryAddress.trim(),
        supermarketId: selectedSupermarketId,
        productId: firstItemProductId,
      });

      toast.success("Order created successfully");
      navigate(`/orders/${order.id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Error creating order");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Card className="border-border">
        <CardContent className="p-8">
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Select Shopping Mode & Items</h2>
              <Separator />
            </div>

            {prefilledFromProduct && cartItems.length > 0 && (
              <div className="space-y-3 rounded-xl border border-border bg-slate-50 p-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">Selected Product</p>
                  <p className="text-sm text-muted-foreground">Item added from product details page.</p>
                </div>
                <div className="space-y-2">
                  {cartItems.map((item) => {
                    const itemTotal = item.quantity * item.unitPrice;
                    const itemPromo = getItemPromotionDiscount(itemTotal);
                    const itemFinal = Math.max(0, itemTotal - itemPromo);
                    return (
                      <div key={`${item.productId || item.name}`} className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium">{item.name} x {item.quantity}</span>
                          {itemPromo > 0 && (
                            <p className="text-xs text-violet-600">Promo -{formatCurrency(itemPromo)}</p>
                          )}
                        </div>
                        <span className="tabular-nums">{formatCurrency(itemFinal)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div>
                  <Label className="text-base">Shopping Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">Choose how you want to build your order.</p>
                </div>
                <Select value={serviceType} onValueChange={(v: 'STANDARD'|'PREMIUM') => setServiceType(v)}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard Bag (Flat Rate per item)</SelectItem>
                    <SelectItem value="PREMIUM">Custom Selection (A-la-carte)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-base">Order Enhancements</Label>
                  <p className="text-sm text-muted-foreground mt-1">Select any priority options for your grocery run.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 border p-3 rounded-lg bg-slate-50 border-border cursor-pointer hover:bg-slate-100 transition-colors">
                    <Checkbox id="express" checked={isExpress} onCheckedChange={(checked) => setIsExpress(checked as boolean)} />
                    <Label htmlFor="express" className="cursor-pointer font-medium text-sm">Express (+{((rules["EXPRESS_MULTIPLIER"] ?? 1.5) - 1) * 100}%)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-lg bg-slate-50 border-border cursor-pointer hover:bg-slate-100 transition-colors">
                    <Checkbox id="priority" checked={isPriority} onCheckedChange={(checked) => setIsPriority(checked as boolean)} />
                    <Label htmlFor="priority" className="cursor-pointer font-medium text-sm">Fresh Priority (+{formatCurrency(rules["DRY_CLEAN_FEE"] ?? 15.00)})</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base" htmlFor="deliveryAddress">Delivery Address</Label>
              <Input
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter delivery address"
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
              <div className="space-y-4">
                {serviceType === 'STANDARD' ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-border space-y-4">
                    <Label className="text-base block">Estimated Number of Items</Label>
                    <div className="flex items-center gap-4">
                      <Input type="number" min="1" max="50" className="h-14 text-2xl font-bold w-32 px-4 shadow-sm" value={itemCount} onChange={(e) => setItemCount(Number(e.target.value))} />
                      <span className="text-muted-foreground font-medium">items @ {formatCurrency(rules["STANDARD_PER_KILO"] ?? 12.50)}/item</span>
                    </div>
                    <p className="text-sm text-muted-foreground">This is an estimate for a standard bag. Final count may vary.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label className="text-base">Shop Essentials</Label>
                    {catalogueLoading ? (
                      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                        Loading products...
                      </div>
                    ) : premiumCatalogue.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                        No products available right now.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {premiumCatalogue.map((c) => (
                          <div key={c.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="font-semibold text-foreground">{c.name}</p>
                              <p className="text-sm text-primary font-medium">{formatCurrency(c.price)}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => addToCart(c)} className="rounded-full px-6">Add to Cart</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-4 lg:border-l lg:pl-10">
                <Label className="text-base">Order Summary</Label>
                <div className="min-h-[200px] flex flex-col pt-2">
                  {serviceType === 'STANDARD' ? (
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-center p-4 rounded-xl bg-white border border-border shadow-sm">
                        <span className="font-medium">Standard Grocery Bag <span className="text-muted-foreground ml-2">({itemCount} items)</span></span>
                        <span className="font-medium tabular-nums">{formatCurrency(itemCount * (rules["STANDARD_PER_KILO"] ?? 12.50))}</span>
                      </div>
                    </div>
                  ) : (
                    cartItems.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border border-dashed border-border/60">
                        <p className="text-muted-foreground">Cart is empty.<br/>Add items from the catalogue.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 flex-1">
                        {cartItems.map((c) => {
                          const itemTotal = c.quantity * c.unitPrice;
                          const itemPromo = getItemPromotionDiscount(itemTotal);
                          const itemFinal = Math.max(0, itemTotal - itemPromo);
                          return (
                            <div key={c.name} className="flex justify-between items-center p-3 rounded-xl bg-white border border-border shadow-sm">
                              <div>
                                <span className="font-medium text-sm"><span className="text-primary mr-2 font-bold">{c.quantity}x</span>{c.name}</span>
                                {itemPromo > 0 && (
                                  <p className="text-xs text-violet-600 mt-1">Promotion -{formatCurrency(itemPromo)}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  {itemPromo > 0 && (
                                    <p className="text-xs text-muted-foreground line-through">{formatCurrency(itemTotal)}</p>
                                  )}
                                  <span className="font-medium tabular-nums text-sm">{formatCurrency(itemFinal)}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeFromCart(c.name)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 rounded-full">✕</Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}

                  {(isExpress || isPriority || discountPercentage > 0) && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      {isPriority && <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium flex items-center gap-1"><span className="text-blue-500 rounded-full h-1.5 w-1.5 bg-blue-500 block relative top-px"></span>Fresh Priority Fee</span><span className="tabular-nums font-medium text-foreground">+{formatCurrency(rules["DRY_CLEAN_FEE"] ?? 15.00)}</span></div>}
                      {isExpress && <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium flex items-center gap-1"><span className="text-orange-500 rounded-full h-1.5 w-1.5 bg-orange-500 block relative top-px"></span>Express Surcharge</span><span className="tabular-nums font-medium text-foreground">+{((rules["EXPRESS_MULTIPLIER"] ?? 1.5) - 1) * 100}%</span></div>}
                      {discountPercentage > 0 && (
                        <div className="flex justify-between text-sm"><span className="text-emerald-600 font-medium flex items-center gap-1"><span className="text-emerald-500 rounded-full h-1.5 w-1.5 bg-emerald-500 block relative top-px"></span>Loyalty Discount ({loyaltyAccount?.tier})</span><span className="tabular-nums font-medium text-emerald-600">-{formatCurrency(calculatedPrice * discountPercentage)}</span></div>
                      )}
                      {promotionDiscount > 0 && (
                        <div className="flex justify-between text-sm"><span className="text-violet-600 font-medium">Promotion Discount</span><span className="tabular-nums font-medium text-violet-600">-{formatCurrency(promotionDiscount)}</span></div>
                      )}
                      {deliveryCharge > 0 && (
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Delivery Charge</span><span className="tabular-nums font-medium text-foreground">+{formatCurrency(deliveryCharge)}</span></div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-auto">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-border">
                    <span className="font-semibold text-muted-foreground">Subtotal</span>
                    <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{formatCurrency(finalPayablePrice)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-md ml-auto space-y-4 border rounded-2xl p-6 bg-slate-50 shadow-sm">
              <div className="space-y-2 text-center">
                <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Amount Due</p>
                <p className="text-4xl font-bold text-foreground tracking-tight">{formatCurrency(finalPayablePrice)}</p>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground text-center">Your order will be created now.</p>
              <div className="pt-2">
                <Button
                  size="lg"
                  className="w-full text-base h-12 rounded-xl"
                  onClick={submitOrder}
                  disabled={processing || (serviceType === "PREMIUM" && cartItems.length === 0)}
                >
                  {processing ? "Creating Order..." : `Place Order ${formatCurrency(finalPayablePrice)}`}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
