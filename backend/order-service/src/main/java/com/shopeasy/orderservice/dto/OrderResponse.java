package com.shopeasy.orderservice.dto;

import java.math.BigDecimal;
import java.time.Instant;

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
    private String productId;
    private String supermarketId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal deliveryCharge;
    private OrderStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
