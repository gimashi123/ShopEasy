package com.shopeasy.promotionservice.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

/**
 * Request body for updating a promotion's discount or active status.
 */
@Data
public class UpdatePromotionRequest {

    @DecimalMin(value = "0.0", message = "Discount must be >= 0")
    @DecimalMax(value = "100.0", message = "Discount must be <= 100")
    private Double discountPercent;

    /**
     * If provided, updates the promotion's active flag.
     */
    private Boolean active;

    private String name;

    private String description;
}
