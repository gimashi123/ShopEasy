package com.shopeasy.reviewservice.controller;

import com.shopeasy.reviewservice.model.Review;
import com.shopeasy.reviewservice.response.ApiResponse;
import com.shopeasy.reviewservice.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 1. CREATE REVIEW (JWT REQUIRED)
    // 1. CREATE REVIEW (JWT REQUIRED)
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createReview(
            @RequestBody Review review,
            @AuthenticationPrincipal String username
    ) {
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", null));
        }

        review.setUserId(username);

        try {
            // Try to add the review
            Review savedReview = reviewService.addReview(review);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Review created successfully", savedReview));

        } catch (RuntimeException e) {
            // Catch the "You have already reviewed this product" error
            // Return a 400 Bad Request (or 409 Conflict) instead of a 500 Server Error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage(), null));
        }
    }

    // 2. GET REVIEWS BY PRODUCT (PUBLIC)
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByProduct(
            @PathVariable String productId
    ) {
        List<Review> reviews = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully", reviews));
    }

    // 3. GET MY REVIEWS (JWT REQUIRED)
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Review>>> getMyReviews(
            @AuthenticationPrincipal String username // <-- Changed to String
    ) {
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", null));
        }

        List<Review> reviews = reviewService.getReviewsByUserId(username); // <-- Use the string directly

        return ResponseEntity.ok(ApiResponse.success("User reviews fetched successfully", reviews));
    }

    // 4. UPDATE REVIEW (ONLY OWNER)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateReview(
            @PathVariable String id,
            @RequestBody Review updatedReview,
            @AuthenticationPrincipal String username // <-- Changed to String
    ) {
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", null));
        }

        try {
            Review review = reviewService.updateReviewSecure(id, updatedReview, username); // <-- Use the string directly
            return ResponseEntity.ok(ApiResponse.success("Review updated successfully", review));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage(), null));
        }
    }

    // 5. DELETE REVIEW (ONLY OWNER)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable String id,
            @AuthenticationPrincipal String username // <-- Changed to String
    ) {
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", null));
        }

        try {
            reviewService.deleteReviewSecure(id, username); // <-- Use the string directly
            return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage(), null));
        }
    }
}