package com.shopeasy.supermarketservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "supermarkets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supermarket {

    @Id
    private String id;

    private String name;

    private String address;

    private String phone;

    private String email;

    private String openingHours;

    private Location location;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private Instant createdAt = Instant.now();

    private Instant updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private Double lat;
        private Double lng;
    }
}
