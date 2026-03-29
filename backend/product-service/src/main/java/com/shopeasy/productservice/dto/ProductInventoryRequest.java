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
 * Request item representing stock for one supermarket.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInventoryRequest {

    @NotBlank(message = "Supermarket id is required")
    private String supermarketId;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be 0 or greater")
    private Integer quantity;
}
