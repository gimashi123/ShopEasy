package com.shopeasy.supermarketservice.dto;

import com.shopeasy.supermarketservice.model.Supermarket;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class SupermarketResponse {

    private String id;
    private String name;
    private String address;
    private String phone;
    private String email;
    private String openingHours;
    private LocationDto location;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    @Getter
    @Builder
    public static class LocationDto {
        private Double lat;
        private Double lng;
    }

    public static SupermarketResponse from(Supermarket supermarket) {
        LocationDto locationDto = null;
        if (supermarket.getLocation() != null) {
            locationDto = LocationDto.builder()
                    .lat(supermarket.getLocation().getLat())
                    .lng(supermarket.getLocation().getLng())
                    .build();
        }

        return SupermarketResponse.builder()
                .id(supermarket.getId())
                .name(supermarket.getName())
                .address(supermarket.getAddress())
                .phone(supermarket.getPhone())
                .email(supermarket.getEmail())
                .openingHours(supermarket.getOpeningHours())
                .location(locationDto)
                .active(supermarket.isActive())
                .createdAt(supermarket.getCreatedAt())
                .updatedAt(supermarket.getUpdatedAt())
                .build();
    }
}
