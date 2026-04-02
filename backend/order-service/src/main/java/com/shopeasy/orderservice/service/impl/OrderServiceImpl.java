package com.shopeasy.orderservice.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.shopeasy.orderservice.client.AuthServiceClient;
import com.shopeasy.orderservice.client.DeliveryServiceClient;
import com.shopeasy.orderservice.client.ProductServiceClient;
import com.shopeasy.orderservice.client.PromotionServiceClient;
import com.shopeasy.orderservice.client.SupermarketServiceClient;
import com.shopeasy.orderservice.client.dto.CustomerInfo;
import com.shopeasy.orderservice.client.dto.ProductInfo;
import com.shopeasy.orderservice.client.dto.PromotionInfo;
import com.shopeasy.orderservice.client.dto.SupermarketInfo;
import com.shopeasy.orderservice.dto.CreateOrderRequest;
import com.shopeasy.orderservice.dto.OrderItemRequest;
import com.shopeasy.orderservice.dto.OrderItemResponse;
import com.shopeasy.orderservice.dto.OrderResponse;
import com.shopeasy.orderservice.dto.UpdateOrderRequest;
import com.shopeasy.orderservice.dto.UpdateOrderStatusRequest;
import com.shopeasy.orderservice.exception.BusinessRuleException;
import com.shopeasy.orderservice.exception.ResourceNotFoundException;
import com.shopeasy.orderservice.model.Order;
import com.shopeasy.orderservice.model.OrderItem;
import com.shopeasy.orderservice.model.OrderStatus;
import com.shopeasy.orderservice.repository.OrderRepository;
import com.shopeasy.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final OrderRepository orderRepository;
    private final AuthServiceClient authServiceClient;
    private final ProductServiceClient productServiceClient;
    private final PromotionServiceClient promotionServiceClient;
    private final SupermarketServiceClient supermarketServiceClient;
    private final DeliveryServiceClient deliveryServiceClient;

    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        List<OrderItem> orderItems = toOrderItems(request.getItems());

        validateExternalReferences(request.getCustomerId(), orderItems, request.getSupermarketId());
        reduceInventoryForOrderItems(orderItems, request.getSupermarketId());
        Instant now = Instant.now();

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .address(request.getAddress())
                .supermarketId(request.getSupermarketId())
                .items(orderItems)
                .discountAmount(resolveDiscountAmount(orderItems))
                .deliveryCharge(defaultAmount(request.getDeliveryCharge()))
                .status(OrderStatus.PENDING)
                .createdAt(now)
                .updatedAt(now)
                .build();

        order.setTotalAmount(calculateTotalAmount(order));
        Order savedOrder = orderRepository.save(order);
        
        // Trigger automatic delivery task creation
        try {
            deliveryServiceClient.createTask(savedOrder.getId(), savedOrder.getAddress());
        } catch (Exception e) {
            // We log but don't fail the order creation if only delivery notification fails
            // Alternatively, you can decide to throw if this is mission-critical
        }

        return toOrderResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    public OrderResponse getOrderById(String id) {
        return toOrderResponse(findOrderById(id));
    }

    @Override
    public OrderResponse updateOrder(String id, UpdateOrderRequest request) {
        List<OrderItem> orderItems = toOrderItems(request.getItems());

        validateExternalReferences(request.getCustomerId(), orderItems, request.getSupermarketId());
        Order existingOrder = findOrderById(id);

        existingOrder.setCustomerId(request.getCustomerId());
        existingOrder.setAddress(request.getAddress());
        existingOrder.setSupermarketId(request.getSupermarketId());
        existingOrder.setItems(orderItems);
        existingOrder.setDiscountAmount(resolveDiscountAmount(orderItems));
        existingOrder.setDeliveryCharge(defaultAmount(request.getDeliveryCharge()));
        existingOrder.setStatus(request.getStatus());
        existingOrder.setUpdatedAt(Instant.now());
        existingOrder.setTotalAmount(calculateTotalAmount(existingOrder));

        return toOrderResponse(orderRepository.save(existingOrder));
    }

    @Override
    public void deleteOrder(String id) {
        Order existingOrder = findOrderById(id);
        orderRepository.delete(existingOrder);
    }

    @Override
    public OrderResponse updateOrderStatus(String id, UpdateOrderStatusRequest request) {
        Order existingOrder = findOrderById(id);

        existingOrder.setStatus(request.getStatus());
        existingOrder.setUpdatedAt(Instant.now());

        return toOrderResponse(orderRepository.save(existingOrder));
    }

    @Override
    public List<OrderResponse> getOrdersByCustomerId(String customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    public List<OrderResponse> getOrdersBySupermarketId(String supermarketId) {
        return orderRepository.findBySupermarketId(supermarketId).stream()
                .map(this::toOrderResponse)
                .toList();
    }

    private Order findOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    private BigDecimal calculateTotalAmount(Order order) {
        BigDecimal subtotal = calculateSubtotal(order);
        BigDecimal deliveryCharge = defaultAmount(order.getDeliveryCharge());
        BigDecimal discountAmount = defaultAmount(order.getDiscountAmount());

        BigDecimal total = subtotal.add(deliveryCharge).subtract(discountAmount);
        return total.max(ZERO);
    }

    private BigDecimal calculateSubtotal(Order order) {
        return order.getItems().stream()
                .map(item -> defaultAmount(item.getUnitPrice())
                        .multiply(BigDecimal.valueOf(requirePositiveQuantity(item.getQuantity()))))
                .reduce(ZERO, BigDecimal::add);
    }

    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? ZERO : amount;
    }

    private BigDecimal resolveDiscountAmount(List<OrderItem> orderItems) {
        return orderItems.stream()
                .map(OrderItem::getProductId)
                .filter(Objects::nonNull)
                .distinct()
                .map(this::resolveProductDiscountAmount)
                .reduce(ZERO, BigDecimal::add);
    }

    private BigDecimal resolveProductDiscountAmount(String productId) {
        PromotionInfo promotionInfo = promotionServiceClient.getPromotionByProductId(productId);
        if (promotionInfo == null || !promotionInfo.applied()) {
            return ZERO;
        }
        return defaultAmount(promotionInfo.discountAmount());
    }

    private void validateExternalReferences(String customerId, List<OrderItem> items, String supermarketId) {
        CustomerInfo customerInfo = authServiceClient.getCustomerById(customerId);
        if (customerInfo == null || !customerInfo.active()) {
            throw new BusinessRuleException("Customer not found or inactive for id: " + customerId);
        }

        items.stream()
                .map(OrderItem::getProductId)
                .distinct()
                .forEach(productId -> {
                    ProductInfo productInfo = productServiceClient.getProductById(productId);
                    if (productInfo == null || !productInfo.available()) {
                        throw new BusinessRuleException("Product not found or unavailable for id: " + productId);
                    }
                });

        SupermarketInfo supermarketInfo = supermarketServiceClient.getSupermarketById(supermarketId);
        if (supermarketInfo == null || !supermarketInfo.active()) {
            throw new BusinessRuleException("Supermarket not found or inactive for id: " + supermarketId);
        }
    }

    /**
     * Reduce stock in product-service immediately when an order is created.
     * We aggregate quantities by product to avoid repeated downstream calls for duplicate product lines.
     */
    private void reduceInventoryForOrderItems(List<OrderItem> items, String supermarketId) {
        Map<String, Integer> quantityByProductId = items.stream()
                .collect(Collectors.groupingBy(
                        OrderItem::getProductId,
                        Collectors.summingInt(item -> requirePositiveQuantity(item.getQuantity()))
                ));

        quantityByProductId.forEach((productId, totalQuantity) ->
                productServiceClient.reduceInventory(productId, supermarketId, totalQuantity));
    }

    private List<OrderItem> toOrderItems(List<OrderItemRequest> itemRequests) {
        if (itemRequests == null || itemRequests.isEmpty()) {
            throw new BusinessRuleException("Order must contain at least one item with productId, quantity and unitPrice");
        }
        return itemRequests.stream()
                .map(item -> toOrderItem(item.getProductId(), item.getQuantity(), item.getUnitPrice()))
                .toList();
    }

    private OrderItem toOrderItem(String productId, Integer quantity, BigDecimal unitPrice) {
        if (!StringUtils.hasText(productId)) {
            throw new BusinessRuleException("Order item productId is required");
        }
        if (quantity == null || quantity < 1) {
            throw new BusinessRuleException("Order item quantity must be at least 1");
        }
        if (unitPrice == null || unitPrice.compareTo(ZERO) < 0) {
            throw new BusinessRuleException("Order item unitPrice cannot be negative");
        }

        return OrderItem.builder()
                .productId(productId)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .build();
    }

    private int requirePositiveQuantity(Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new IllegalStateException("Order quantity must be at least 1");
        }
        return quantity;
    }

    private List<OrderItemResponse> toOrderItemResponses(Order order) {
        List<OrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) {
            return List.of();
        }

        return items.stream()
                .map(item -> OrderItemResponse.builder()
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .build())
                .toList();
    }

    private OrderResponse toOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .address(order.getAddress())
                .supermarketId(order.getSupermarketId())
                .items(toOrderItemResponses(order))
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .deliveryCharge(order.getDeliveryCharge())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
