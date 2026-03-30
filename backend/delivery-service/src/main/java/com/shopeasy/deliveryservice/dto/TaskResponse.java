package com.shopeasy.deliveryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private String id;
    private String orderId;
    private String driverId;
    private String status;
    private List<String> rejectedByDriverIds;
    private String deliveryAddress;
    private Instant acceptedAt;
    private Instant deliveredAt;
    private Instant createdAt;
    private Instant updatedAt;
}
