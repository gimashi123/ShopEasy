package com.shopeasy.productservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Request body used for create and update product operations.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 40, message = "SKU must not exceed 40 characters")
    private String sku;

    @NotBlank(message = "Product name is required")
    @Size(max = 120, message = "Product name must not exceed 120 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Size(max = 80, message = "Category must not exceed 80 characters")
    private String category;

    @Size(max = 80, message = "Brand must not exceed 80 characters")
    private String brand;

    @NotBlank(message = "Supermarket id is required")
    private String supermarketId;

    // Store the image as a URL/path instead of raw binary to keep the service simple.
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    @Pattern(
            regexp = "^(https?://.*|/.*)?$",
            message = "Image URL must be a valid http/https URL or start with /"
    )
    private String imageUrl;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be 0 or greater")
    private Integer quantity;
}
