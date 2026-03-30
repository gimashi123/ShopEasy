package com.shopeasy.orderservice.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

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
    private String address;
    private String supermarketId;

    private List<OrderItem> items;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal deliveryCharge;

    private OrderStatus status;

    private Instant createdAt;
    private Instant updatedAt;
}
