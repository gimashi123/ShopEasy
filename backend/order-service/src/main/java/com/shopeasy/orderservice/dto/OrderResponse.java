package com.shopeasy.orderservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.shopeasy.orderservice.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private String id;
    private String customerId;
    private String address;
    private String supermarketId;
    private List<OrderItemResponse> items;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal deliveryCharge;
    private OrderStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
