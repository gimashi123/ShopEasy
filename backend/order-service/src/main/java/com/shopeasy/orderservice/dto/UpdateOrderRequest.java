package com.shopeasy.orderservice.dto;

import java.math.BigDecimal;
import java.util.List;

import com.shopeasy.orderservice.model.OrderStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.Valid;
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

    private String address;

    @NotBlank(message = "Supermarket ID is required")
    private String supermarketId;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount amount cannot be negative")
    private BigDecimal discountAmount;

    @DecimalMin(value = "0.0", inclusive = true, message = "Delivery charge cannot be negative")
    private BigDecimal deliveryCharge;

    @NotNull(message = "Order status is required")
    private OrderStatus status;
}
