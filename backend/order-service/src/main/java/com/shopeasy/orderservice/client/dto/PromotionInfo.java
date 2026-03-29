package com.shopeasy.orderservice.client.dto;

import java.math.BigDecimal;

import lombok.Builder;

@Builder
public record PromotionInfo(
        String productId,
        BigDecimal discountAmount,
        boolean applied
) {
}
