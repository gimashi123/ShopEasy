package com.shopeasy.deliveryservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
}
