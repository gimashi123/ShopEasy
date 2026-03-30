package com.shopeasy.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Response item representing stock for one supermarket.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInventoryResponse {

    private String supermarketId;
    private Integer quantity;
}
