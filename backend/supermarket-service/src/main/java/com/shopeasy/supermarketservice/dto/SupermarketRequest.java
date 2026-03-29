package com.shopeasy.supermarketservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupermarketRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String address;

    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String openingHours;

    private LocationDto location;

    @Getter
    @Setter
    public static class LocationDto {
        private Double lat;
        private Double lng;
    }
}
