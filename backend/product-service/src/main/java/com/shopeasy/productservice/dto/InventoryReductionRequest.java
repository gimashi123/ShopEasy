package com.shopeasy.productservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request used when another service needs to reduce stock for a supermarket.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReductionRequest {

    @NotBlank(message = "Supermarket id is required")
    private String supermarketId;

    @NotNull(message = "Reduction quantity is required")
    @Min(value = 1, message = "Reduction quantity must be at least 1")
    private Integer quantity;
}
