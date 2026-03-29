package com.shopeasy.orderservice.client.dto;

import lombok.Builder;

@Builder
public record SupermarketInfo(
        String id,
        String name,
        boolean active
) {
}
