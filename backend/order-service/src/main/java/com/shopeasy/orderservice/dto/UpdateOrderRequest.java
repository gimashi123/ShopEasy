package com.shopeasy.orderservice.dto;

import java.math.BigDecimal;

import com.shopeasy.orderservice.model.OrderStatus;
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
public class UpdateOrderRequest {

    private static final String OBJECT_ID_REGEX = "^[a-fA-F0-9]{24}$";

    @NotBlank(message = "Customer ID is required")
    @Pattern(regexp = OBJECT_ID_REGEX, message = "Customer ID must be a valid 24-character ObjectId")
    private String customerId;

    @NotBlank(message = "Product ID is required")
    @Pattern(regexp = OBJECT_ID_REGEX, message = "Product ID must be a valid 24-character ObjectId")
    private String productId;

    @NotBlank(message = "Supermarket ID is required")
    @Pattern(regexp = OBJECT_ID_REGEX, message = "Supermarket ID must be a valid 24-character ObjectId")
    private String supermarketId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Unit price cannot be negative")
    private BigDecimal unitPrice;

    @NotNull(message = "Discount amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Discount amount cannot be negative")
    private BigDecimal discountAmount;

    @NotNull(message = "Delivery charge is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Delivery charge cannot be negative")
    private BigDecimal deliveryCharge;

    @NotNull(message = "Order status is required")
    private OrderStatus status;
}
