package com.shopeasy.productservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * MongoDB document for the product catalog.
 * This service owns product data and exposes it to other services through APIs.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @Indexed(unique = true)
    private String sku;

    private String name;
    private String description;
    private String category;
    private String brand;
    private String supermarketId;
    private String imageUrl;
    private BigDecimal price;
    private Integer quantity;
    private Boolean available;
    private Instant createdAt;
    private Instant updatedAt;
}
