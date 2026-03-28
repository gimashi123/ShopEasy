package com.shopeasy.promotionservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.Instant;

/**
 * Request body for creating a new promotion.
 */
@Data
public class CreatePromotionRequest {

    @NotBlank(message = "Promotion name is required")
    private String name;

    private String description;

    /**
     * Linked product ID. If null, promotion applies globally to all products.
     */
    private String productId;
    private String productName;
    private String supermarketName;

    private String imageUrl;

    @NotNull(message = "Discount percent is required")
    @DecimalMin(value = "0.0", message = "Discount must be >= 0")
    @DecimalMax(value = "100.0", message = "Discount must be <= 100")
    private Double discountPercent;

    private boolean active = true;

    private Instant startDate;

    private Instant endDate;
}
