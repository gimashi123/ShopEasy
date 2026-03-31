import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, getOrderStatusVariant } from "@/lib/helpers";
import { orderService, type Order, type OrderStatus } from "@/services/orderService";
import { supermarketService } from "@/services/supermarketService";
import { Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PICKED_UP",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "CONFIRMED",
  "DISPATCHED",
  "IN_CLEANING",
];

type OrderScope = "ALL" | "SUPERMARKET" | "CUSTOMER";

const ALLOWED_NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  IN_CLEANING: ["OUT_FOR_DELIVERY"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
};

export default function AdminOrderPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) => role.includes("ROLE_ADMIN"));

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [scope, setScope] = useState<OrderScope>("ALL");
  const [supermarketFilter, setSupermarketFilter] = useState<string>("ALL");
  const [customerFilter, setCustomerFilter] = useState<string>("ALL");

  const [supermarketNames, setSupermarketNames] = useState<Record<string, string>>({});
  const [savingStatusFor, setSavingStatusFor] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);

    const [ordersResult, supermarketsResult] = await Promise.allSettled([
      orderService.getAllOrders(),
      supermarketService.getAll(),
    ]);

    if (ordersResult.status === "fulfilled") {
      setOrders(ordersResult.value);
    } else {
      setOrders([]);
      toast.error("Failed to load orders");
    }

    if (supermarketsResult.status === "fulfilled") {
      setSupermarketNames(
        supermarketsResult.value.reduce<Record<string, string>>((acc, supermarket) => {
          acc[supermarket.id] = supermarket.name;
          return acc;
        }, {})
      );
    } else {
      setSupermarketNames({});
      toast.error("Failed to load supermarkets");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const supermarketOptions = useMemo(() => {
    const ids = new Set<string>();
    orders.forEach((order) => {
      if (order.supermarketId) ids.add(order.supermarketId);
    });

    return Array.from(ids)
      .map((id) => ({ id, name: supermarketNames[id] || `Supermarket ${id.slice(-6)}` }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [orders, supermarketNames]);

  const customerOptions = useMemo(() => {
    const ids = new Set<string>();
    orders.forEach((order) => {
      if (order.customerId) ids.add(order.customerId);
    });

    return Array.from(ids).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;

      if (scope === "SUPERMARKET" && supermarketFilter !== "ALL" && order.supermarketId !== supermarketFilter) {
        return false;
      }

      if (scope === "CUSTOMER" && customerFilter !== "ALL" && order.customerId !== customerFilter) {
        return false;
      }

      if (!query) return true;

      return [order.id, order.customerId, order.supermarketId || ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [orders, search, statusFilter, scope, supermarketFilter, customerFilter]);

  const handleQuickStatusUpdate = async (order: Order, nextStatus: OrderStatus) => {
    if (order.status === nextStatus) return;
    const allowedNext = ALLOWED_NEXT_STATUSES[order.status] || [];
    if (!allowedNext.includes(nextStatus)) {
      toast.error(`Invalid status transition from ${order.status.replace(/_/g, " ")}`);
      return;
    }

    setSavingStatusFor(order.id);
    try {
      const updatedOrder = await orderService.updateOrderStatus(order.id, nextStatus);
      setOrders((prev) => prev.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)));
      toast.success(`Order ${order.id} updated to ${updatedOrder.status.replace(/_/g, " ")}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update order status");
    } finally {
      setSavingStatusFor(null);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all orders, filter by supermarket or customer, and manage delivery status.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="relative md:col-span-2 xl:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order/customer/supermarket ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={scope} onValueChange={(value) => setScope(value as OrderScope)}>
              <SelectTrigger>
                <SelectValue placeholder="View scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Orders</SelectItem>
                <SelectItem value="SUPERMARKET">By Supermarket</SelectItem>
                <SelectItem value="CUSTOMER">By Customer</SelectItem>
              </SelectContent>
            </Select>

            {scope === "SUPERMARKET" ? (
              <Select value={supermarketFilter} onValueChange={setSupermarketFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supermarket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Supermarkets</SelectItem>
                  {supermarketOptions.map((supermarket) => (
                    <SelectItem key={supermarket.id} value={supermarket.id}>
                      {supermarket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : scope === "CUSTOMER" ? (
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Customers</SelectItem>
                  {customerOptions.map((customerId) => (
                    <SelectItem key={customerId} value={customerId}>
                      {customerId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="hidden xl:block" />
            )}

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Skeleton key={n} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium text-foreground">No orders found</p>
              <p className="text-sm text-muted-foreground">Try changing the filters to see more orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Supermarket</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const isSavingThisOrder = savingStatusFor === order.id;
                    const allowedNextStatuses = ALLOWED_NEXT_STATUSES[order.status] || [];

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Link to={`/orders/${order.id}`} className="text-primary hover:underline font-medium tabular-nums">
                            {order.id}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">{order.customerId}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order.supermarketId
                            ? supermarketNames[order.supermarketId] || order.supermarketId
                            : "Unassigned"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order.items.length} item{order.items.length === 1 ? "" : "s"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          {formatCurrency(order.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Badge
                              variant={getOrderStatusVariant(order.status)}
                              className="font-semibold uppercase text-[10px] tracking-wider"
                            >
                              {order.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {allowedNextStatuses.includes("PICKED_UP") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickStatusUpdate(order, "PICKED_UP")}
                                disabled={isSavingThisOrder}
                              >
                                Pickup
                              </Button>
                            )}
                            {allowedNextStatuses.includes("PROCESSING") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickStatusUpdate(order, "PROCESSING")}
                                disabled={isSavingThisOrder}
                              >
                                Processing
                              </Button>
                            )}
                            {allowedNextStatuses.includes("OUT_FOR_DELIVERY") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickStatusUpdate(order, "OUT_FOR_DELIVERY")}
                                disabled={isSavingThisOrder}
                              >
                                Out for Delivery
                              </Button>
                            )}
                            {allowedNextStatuses.includes("DELIVERED") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickStatusUpdate(order, "DELIVERED")}
                                disabled={isSavingThisOrder}
                              >
                                Delivered
                              </Button>
                            )}
                            {allowedNextStatuses.includes("CANCELLED") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleQuickStatusUpdate(order, "CANCELLED")}
                                disabled={isSavingThisOrder}
                              >
                                Cancel
                              </Button>
                            )}
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/orders/${order.id}`}>View</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
