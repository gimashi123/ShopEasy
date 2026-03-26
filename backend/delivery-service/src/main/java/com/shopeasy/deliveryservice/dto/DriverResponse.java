package com.shopeasy.deliveryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String vehicleType;
    private String licenseNumber;
    private boolean available;
    private Instant createdAt;
    private Instant updatedAt;
}
