package com.shopeasy.orderservice.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.shopeasy.orderservice.dto.CreateOrderRequest;
import com.shopeasy.orderservice.dto.OrderResponse;
import com.shopeasy.orderservice.dto.UpdateOrderRequest;
import com.shopeasy.orderservice.dto.UpdateOrderStatusRequest;
import com.shopeasy.orderservice.exception.ResourceNotFoundException;
import com.shopeasy.orderservice.model.Order;
import com.shopeasy.orderservice.model.OrderStatus;
import com.shopeasy.orderservice.repository.OrderRepository;
import com.shopeasy.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final OrderRepository orderRepository;

    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        Instant now = Instant.now();

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .productId(request.getProductId())
                .supermarketId(request.getSupermarketId())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .discountAmount(defaultAmount(request.getDiscountAmount()))
                .deliveryCharge(defaultAmount(request.getDeliveryCharge()))
                .status(OrderStatus.PENDING)
                .createdAt(now)
                .updatedAt(now)
                .build();

        order.setTotalAmount(calculateTotalAmount(order));

        return toOrderResponse(orderRepository.save(order));
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
        Order existingOrder = findOrderById(id);

        existingOrder.setCustomerId(request.getCustomerId());
        existingOrder.setProductId(request.getProductId());
        existingOrder.setSupermarketId(request.getSupermarketId());
        existingOrder.setQuantity(request.getQuantity());
        existingOrder.setUnitPrice(request.getUnitPrice());
        existingOrder.setDiscountAmount(defaultAmount(request.getDiscountAmount()));
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
        BigDecimal unitPrice = defaultAmount(order.getUnitPrice());
        BigDecimal deliveryCharge = defaultAmount(order.getDeliveryCharge());
        BigDecimal discountAmount = defaultAmount(order.getDiscountAmount());
        BigDecimal quantity = BigDecimal.valueOf(requirePositiveQuantity(order.getQuantity()));

        BigDecimal subtotal = unitPrice.multiply(quantity);
        BigDecimal total = subtotal.add(deliveryCharge).subtract(discountAmount);

        return total.max(ZERO);
    }

    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? ZERO : amount;
    }

    private int requirePositiveQuantity(Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new IllegalStateException("Order quantity must be at least 1");
        }
        return quantity;
    }

    private OrderResponse toOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .productId(order.getProductId())
                .supermarketId(order.getSupermarketId())
                .quantity(order.getQuantity())
                .unitPrice(order.getUnitPrice())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .deliveryCharge(order.getDeliveryCharge())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
