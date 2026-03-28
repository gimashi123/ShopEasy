package com.shopeasy.promotionservice.model;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Represents a product promotion/discount stored in MongoDB.
 */
@Document(collection = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    private String id;

    @NotBlank
    private String name;

    private String description;

    /**
     * The productId this promotion applies to.
     * If null, this is a global promotion that applies to all products.
     */
    private String productId;
    private String productName;
    private String supermarketName;

    private String imageUrl;

    /**
     * Discount percentage (0.0 to 100.0).
     */
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private double discountPercent;

    @Builder.Default
    private boolean active = true;

    private Instant startDate;

    private Instant endDate;

    @Builder.Default
    private Instant createdAt = Instant.now();

    private Instant updatedAt;
}
