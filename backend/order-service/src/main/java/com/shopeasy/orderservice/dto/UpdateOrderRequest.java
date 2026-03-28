package com.shopeasy.orderservice.dto;

import java.math.BigDecimal;

import com.shopeasy.orderservice.model.OrderStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderRequest {

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotBlank(message = "Product ID is required")
    private String productId;

    @NotBlank(message = "Supermarket ID is required")
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
