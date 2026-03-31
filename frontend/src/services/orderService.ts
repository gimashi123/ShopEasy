import api from "@/lib/api";

export type OrderStatus =
  | "PENDING"
  | "PICKED_UP"
  | "IN_CLEANING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "CONFIRMED"
  | "PROCESSING"
  | "DISPATCHED";

export interface OrderItem {
  id?: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface TimeSlot {
  date: string;
  time: string;
}

export interface Order {
  id: string;
  customerId: string;
  address?: string;
  supermarketId?: string;
  discountAmount?: number;
  deliveryCharge?: number;
  status: OrderStatus;
  serviceType: "STANDARD" | "PREMIUM";
  weight?: number;
  items: OrderItem[];
  isExpress: boolean;
  isDryClean: boolean;
  totalPrice: number;
  pickupSlot?: TimeSlot;
  deliverySlot?: TimeSlot;
  createdAt: string;
  updatedAt?: string;
}

interface BackendOrder {
  id: string;
  customerId: string;
  address?: string;
  supermarketId?: string;
  items?: Array<{
    productId: string;
    quantity: number | string;
    unitPrice: number | string;
  }>;
  discountAmount?: number | string;
  totalAmount?: number | string;
  deliveryCharge?: number | string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
}

const unwrap = (res: any) => res.data?.data ?? res.data;

const DEFAULT_PRICING_RULES: Record<string, number> = {
  STANDARD_PER_KILO: 12.5,
  DRY_CLEAN_FEE: 15,
  EXPRESS_MULTIPLIER: 1.5,
};

const SLOT_STORAGE_KEY = "order_time_slots";

const isObjectId = (value?: string) => Boolean(value && /^[a-fA-F0-9]{24}$/.test(value));

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const mapBackendStatusToFrontend = (status: BackendOrder["status"]): OrderStatus => {
  switch (status) {
    case "CONFIRMED":
      return "PICKED_UP";
    case "DISPATCHED":
      return "OUT_FOR_DELIVERY";
    case "PROCESSING":
      return "PROCESSING";
    default:
      return status;
  }
};

const mapFrontendStatusToBackend = (status: OrderStatus): BackendOrder["status"] => {
  switch (status) {
    case "PICKED_UP":
      return "CONFIRMED";
    case "OUT_FOR_DELIVERY":
      return "DISPATCHED";
    case "IN_CLEANING":
    case "PROCESSING":
      return "PROCESSING";
    case "DELIVERED":
      return "DELIVERED";
    case "CANCELLED":
      return "CANCELLED";
    case "PENDING":
      return "PENDING";
    case "CONFIRMED":
      return "CONFIRMED";
    case "DISPATCHED":
      return "DISPATCHED";
    default:
      return "PENDING";
  }
};

const readSlots = (): Record<string, { pickupSlot?: TimeSlot; deliverySlot?: TimeSlot }> => {
  try {
    return JSON.parse(localStorage.getItem(SLOT_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeSlots = (value: Record<string, { pickupSlot?: TimeSlot; deliverySlot?: TimeSlot }>) => {
  localStorage.setItem(SLOT_STORAGE_KEY, JSON.stringify(value));
};

const mapBackendOrderToFrontend = (order: BackendOrder): Order => {
  const slots = readSlots()[order.id] || {};
  const normalizedItems = (order.items || []).map((item) => ({
    id: item.productId,
    productId: item.productId,
    name: `Product ${item.productId.slice(-6)}`,
    quantity: Math.max(1, Math.floor(toNumber(item.quantity))),
    unitPrice: toNumber(item.unitPrice),
  }));

  const quantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryCharge = toNumber(order.deliveryCharge);
  const discountAmount = toNumber(order.discountAmount);

  return {
    id: order.id,
    customerId: order.customerId,
    address: order.address,
    supermarketId: order.supermarketId,
    discountAmount,
    deliveryCharge,
    status: mapBackendStatusToFrontend(order.status),
    serviceType: normalizedItems.length > 1 ? "PREMIUM" : quantity > 1 ? "STANDARD" : "PREMIUM",
    weight: quantity,
    items: normalizedItems,
    isExpress: deliveryCharge > 0,
    isDryClean: discountAmount > 0,
    totalPrice: toNumber(order.totalAmount),
    pickupSlot: slots.pickupSlot,
    deliverySlot: slots.deliverySlot,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

class OrderService {
  async calculatePrice(
    serviceType: "STANDARD" | "PREMIUM",
    options: { weight?: number; items?: OrderItem[]; isExpress: boolean; isDryClean: boolean },
    rules: Record<string, number>
  ): Promise<number> {
    const stdPerKg = rules["STANDARD_PER_KILO"] ?? 12.5;
    const dryCleanFee = rules["DRY_CLEAN_FEE"] ?? 15;
    const expressMult = rules["EXPRESS_MULTIPLIER"] ?? 1.5;

    let basePrice = 0;
    if (serviceType === "STANDARD") {
      basePrice = (options.weight || 0) * stdPerKg;
    } else {
      basePrice = (options.items || []).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    }

    if (options.isDryClean) basePrice += dryCleanFee;
    if (options.isExpress) basePrice *= expressMult;

    return Number(basePrice.toFixed(2));
  }

  async createOrder(
    customerId: string,
    serviceType: "STANDARD" | "PREMIUM",
    options: {
      weight?: number;
      items?: OrderItem[];
      isExpress: boolean;
      isDryClean: boolean;
      pickupSlot?: TimeSlot;
      deliverySlot?: TimeSlot;
      totalPrice: number;
      address?: string;
      productId?: string;
      supermarketId?: string;
    }
  ): Promise<Order> {
    const productId = options.productId || import.meta.env.VITE_DEFAULT_PRODUCT_ID;
    const supermarketId = options.supermarketId || import.meta.env.VITE_DEFAULT_SUPERMARKET_ID;

    if (!isObjectId(customerId) || !isObjectId(supermarketId)) {
      throw new Error(
        "Invalid IDs. Ensure customerId/supermarketId are valid 24-char ObjectIds (set VITE_DEFAULT_SUPERMARKET_ID)."
      );
    }

    const quantityForStandard = Math.max(1, Math.floor(options.weight || 1));
    const totalPrice = Number(options.totalPrice || 0);
    const unitPriceForStandard = Number((totalPrice / quantityForStandard).toFixed(2));

    const itemsPayload =
      serviceType === "STANDARD"
        ? [
          {
            productId,
            quantity: quantityForStandard,
            unitPrice: unitPriceForStandard,
          },
        ]
        : (options.items || []).map((item) => ({
          productId: isObjectId(item.productId || item.id) ? (item.productId || item.id)! : productId,
          quantity: Math.max(1, Math.floor(item.quantity || 0)),
          unitPrice: Number(item.unitPrice || 0),
        }));

    if (!isObjectId(productId) || itemsPayload.some((item) => !isObjectId(item.productId))) {
      throw new Error(
        "Invalid product IDs. Provide item productId/id as 24-char ObjectIds or set VITE_DEFAULT_PRODUCT_ID."
      );
    }

    const payload = {
      customerId,
      address: options.address,
      supermarketId,
      items: itemsPayload,
      discountAmount: 0,
      deliveryCharge: 0,
    };

    // OLD FRONTEND PAYLOAD (kept for reference, not removed):
    // const payload = {
    //   customerId,
    //   serviceType,
    //   weight: options.weight,
    //   items: options.items,
    //   isExpress: options.isExpress,
    //   isDryClean: options.isDryClean,
    //   pickupSlot: options.pickupSlot,
    //   deliverySlot: options.deliverySlot,
    //   totalPrice: options.totalPrice
    // };

    const res = await api.post("/orders", payload);
    const created = mapBackendOrderToFrontend(unwrap(res));

    if (options.pickupSlot || options.deliverySlot) {
      const current = readSlots();
      current[created.id] = {
        pickupSlot: options.pickupSlot,
        deliverySlot: options.deliverySlot,
      };
      writeSlots(current);
      return {
        ...created,
        pickupSlot: options.pickupSlot,
        deliverySlot: options.deliverySlot,
      };
    }

    return created;
  }

  async getOrderById(orderId: string | number): Promise<Order | null> {
    const res = await api.get(`/orders/${orderId}`);
    return mapBackendOrderToFrontend(unwrap(res));
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const res = await api.get(`/orders/customer/${customerId}`);
    return (unwrap(res) || []).map((o: BackendOrder) => mapBackendOrderToFrontend(o));
  }

  async getAllOrders(): Promise<Order[]> {
    const res = await api.get("/orders");
    return (unwrap(res) || []).map((o: BackendOrder) => mapBackendOrderToFrontend(o));
  }

  async assignPickupSlot(orderId: string | number, timeSlot: TimeSlot): Promise<Order> {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const current = readSlots();
    current[String(orderId)] = {
      ...current[String(orderId)],
      pickupSlot: timeSlot,
    };
    writeSlots(current);

    // OLD APPROACH (kept for reference, not removed):
    // const updatePayload = { ...order, pickupSlot: timeSlot };
    // const res = await api.put(`/orders/${orderId}`, updatePayload);
    // return unwrap(res);

    return { ...order, pickupSlot: timeSlot };
  }

  async assignDeliverySlot(orderId: string | number, timeSlot: TimeSlot): Promise<Order> {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const current = readSlots();
    current[String(orderId)] = {
      ...current[String(orderId)],
      deliverySlot: timeSlot,
    };
    writeSlots(current);

    // OLD APPROACH (kept for reference, not removed):
    // const updatePayload = { ...order, deliverySlot: timeSlot };
    // const res = await api.put(`/orders/${orderId}`, updatePayload);
    // return unwrap(res);

    return { ...order, deliverySlot: timeSlot };
  }

  async updateOrderStatus(orderId: string | number, status: OrderStatus): Promise<Order> {
    const backendStatus = mapFrontendStatusToBackend(status);
    const res = await api.patch(`/orders/${orderId}/status`, { status: backendStatus });

    // OLD APPROACH (kept for reference, not removed):
    // const res = await api.patch(`/orders/${orderId}/status`, { status });

    return mapBackendOrderToFrontend(unwrap(res));
  }

  async cancelOrder(orderId: string | number): Promise<Order> {
    return this.updateOrderStatus(orderId, "CANCELLED");
  }

  async markPickedUp(orderId: string | number) {
    return this.updateOrderStatus(orderId, "PICKED_UP");
  }

  async markInCleaning(orderId: string | number) {
    return this.updateOrderStatus(orderId, "PROCESSING");
  }

  async markOutForDelivery(orderId: string | number) {
    return this.updateOrderStatus(orderId, "OUT_FOR_DELIVERY");
  }

  async markDelivered(orderId: string | number) {
    return this.updateOrderStatus(orderId, "DELIVERED");
  }

  async getPricingRules(): Promise<Record<string, number>> {
    // OLD API CALL (kept for reference, not removed):
    // const res = await api.get("/orders/pricing");
    // return unwrap(res);
    return DEFAULT_PRICING_RULES;
  }

  async updatePricingRules(rules: Record<string, number>): Promise<Record<string, number>> {
    // OLD API CALL (kept for reference, not removed):
    // const res = await api.put("/orders/pricing", rules);
    // return unwrap(res);
    return rules;
  }
}

export const orderService = new OrderService();
