package com.shopeasy.orderservice.model;

import java.math.BigDecimal;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "order")
public class Order {

    @Id
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
