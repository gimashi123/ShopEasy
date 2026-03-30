package com.shopeasy.orderservice.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    private static final String OBJECT_ID_REGEX = "^[a-fA-F0-9]{24}$";

    @NotBlank(message = "Product ID is required")
    @Pattern(regexp = OBJECT_ID_REGEX, message = "Product ID must be a valid 24-character ObjectId")
    private String productId;

    @NotNull(message = "Item quantity is required")
    @Min(value = 1, message = "Item quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Item unit price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Item unit price cannot be negative")
    private BigDecimal unitPrice;
}
