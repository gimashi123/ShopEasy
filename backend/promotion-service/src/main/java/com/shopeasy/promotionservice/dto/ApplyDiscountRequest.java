package com.shopeasy.promotionservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/**
 * Request to apply an active promotion discount to a product price.
 * Called by the Order Service when processing an order.
 */
@Data
public class ApplyDiscountRequest {

    @NotBlank(message = "productId is required")
    private String productId;

    @NotNull(message = "originalPrice is required")
    @Positive(message = "originalPrice must be positive")
    private Double originalPrice;
}
