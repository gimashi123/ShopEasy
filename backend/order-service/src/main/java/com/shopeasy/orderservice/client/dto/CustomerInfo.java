package com.shopeasy.orderservice.client.dto;

import lombok.Builder;

@Builder
public record CustomerInfo(
        String id,
        boolean active
) {
}
