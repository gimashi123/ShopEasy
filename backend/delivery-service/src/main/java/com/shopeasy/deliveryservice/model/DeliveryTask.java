package com.shopeasy.deliveryservice.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "delivery_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryTask {
    @Id
    private String id;

    private String orderId;
    private String driverId;
    private String status; // PENDING, ACCEPTED, IN_TRANSIT, DELIVERED, CANCELLED

    @Builder.Default
    private List<String> rejectedByDriverIds = new ArrayList<>();

    private String deliveryAddress;

    private Instant acceptedAt;
    private Instant deliveredAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
