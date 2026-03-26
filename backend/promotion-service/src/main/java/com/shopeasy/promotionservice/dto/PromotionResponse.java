package com.shopeasy.promotionservice.dto;

import lombok.*;

import java.time.Instant;

/**
 * Response DTO representing a promotion.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionResponse {

    private String id;
    private String name;
    private String description;
    private String productId;
    private double discountPercent;
    private boolean active;
    private Instant startDate;
    private Instant endDate;
    private Instant createdAt;
    private Instant updatedAt;
}
