package com.shopeasy.orderservice.client.dto;

import java.math.BigDecimal;

import lombok.Builder;

@Builder
public record ProductInfo(
        String id,
        String name,
        BigDecimal unitPrice,
        boolean available
) {
}
