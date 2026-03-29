package com.shopeasy.promotionservice.dto;

import lombok.*;

/**
 * Response returned after applying a discount to a product price.
 * Includes the final price and which promotion was applied (if any).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyDiscountResponse {

    private String productId;
    private double originalPrice;

    /** The discount percent that was applied (0 if no active promotion). */
    private double discountPercent;

    /** The final price after applying the discount. */
    private double finalPrice;

    /** Promotion ID that was applied; null if no promotion found. */
    private String promotionId;

    /** Promotion name that was applied; null if no promotion found. */
    private String promotionName;

    /** Whether a promotion was applied. */
    private boolean promotionApplied;
}
