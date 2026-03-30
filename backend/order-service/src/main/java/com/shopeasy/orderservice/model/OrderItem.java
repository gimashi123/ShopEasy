package com.shopeasy.orderservice.model;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    private String productId;
    private Integer quantity;
    private BigDecimal unitPrice;
}
