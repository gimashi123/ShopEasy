package com.shopeasy.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Response model returned to clients and other services.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private String id;
    private String sku;
    private String name;
    private String description;
    private String category;
    private String brand;
    private String imageUrl;
    private BigDecimal price;
    private Integer quantity;
    private Boolean available;
    private Instant createdAt;
    private Instant updatedAt;
}
