package com.shopeasy.promotionservice.controller;

import com.shopeasy.common.response.ApiResponse;
import com.shopeasy.promotionservice.dto.*;
import com.shopeasy.promotionservice.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing all promotion CRUD endpoints + the apply-discount integration endpoint.
 *
 * Base path: /api/promotions  (routed from Gateway on port 8080)
 */
@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permissive for testing; Gateway handles restricted CORS
public class PromotionController {

    private final PromotionService promotionService;

    // ─── CREATE ───────────────────────────────────────────────────────────────

    /**
     * Add a new promotion.
     * POST /api/promotions
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(
            @Valid @RequestBody CreatePromotionRequest request) {
        PromotionResponse response = promotionService.createPromotion(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Promotion created successfully", response));
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    /**
     * Get all promotions.
     * GET /api/promotions
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAllPromotions() {
        return ResponseEntity.ok(
                ApiResponse.success("Promotions retrieved successfully",
                        promotionService.getAllPromotions()));
    }

    /**
     * Get only active promotions.
     * GET /api/promotions/active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getActivePromotions() {
        return ResponseEntity.ok(
                ApiResponse.success("Active promotions retrieved successfully",
                        promotionService.getActivePromotions()));
    }

    /**
     * Get a single promotion by ID.
     * GET /api/promotions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> getPromotionById(
            @PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.success("Promotion retrieved successfully",
                        promotionService.getPromotionById(id)));
    }

    /**
     * Get all promotions for a specific product.
     * GET /api/promotions/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getPromotionsByProduct(
            @PathVariable String productId) {
        return ResponseEntity.ok(
                ApiResponse.success("Product promotions retrieved successfully",
                        promotionService.getPromotionsByProductId(productId)));
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    /**
     * Change discount percent / active flag / name / description.
     * PUT /api/promotions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(
            @PathVariable String id,
            @Valid @RequestBody UpdatePromotionRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Promotion updated successfully",
                        promotionService.updatePromotion(id, request)));
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    /**
     * Remove a promotion by ID.
     * DELETE /api/promotions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(
            @PathVariable String id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(
                ApiResponse.success("Promotion deleted successfully", null));
    }

    // ─── APPLY DISCOUNT ───────────────────────────────────────────────────────

    /**
     * Apply the best available discount for a product price.
     * Called by the Order Service to compute the final price.
     *
     * POST /api/promotions/apply-discount
     * Body: { "productId": "...", "originalPrice": 100.0 }
     */
    @PostMapping("/apply-discount")
    public ResponseEntity<ApiResponse<ApplyDiscountResponse>> applyDiscount(
            @Valid @RequestBody ApplyDiscountRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Discount applied successfully",
                        promotionService.applyDiscount(request)));
    }
}
