
//package com.shopeasy.reviewservice.controller;
//
//import com.shopeasy.reviewservice.model.Review;
//import com.shopeasy.reviewservice.service.ReviewService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.core.userdetails.User;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
///**
// * REST Controller for Review Microservice
// */
//@RestController
//@RequestMapping("/api/reviews")
//@RequiredArgsConstructor
//public class ReviewController {
//
//    private final ReviewService reviewService;
//
//    // ==========================================
//    // 1. CREATE REVIEW (JWT REQUIRED)
//    // ==========================================
//    @PostMapping
//    public ResponseEntity<Review> createReview(
//            @RequestBody Review review,
//            @AuthenticationPrincipal User user
//    ) {
//        if (user == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//
//        // 🔥 Set logged-in user
//        review.setUserId(user.getUsername());
//
//        Review savedReview = reviewService.addReview(review);
//
//        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
//    }
//
//    // ==========================================
//    // 2. GET REVIEWS BY PRODUCT (PUBLIC)
//    // ==========================================
//    @GetMapping("/product/{productId}")
//    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable String productId) {
//        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
//    }
//
//    // ==========================================
//    // 3. GET MY REVIEWS (JWT REQUIRED)
//    // ==========================================
//    @GetMapping("/my")
//    public ResponseEntity<List<Review>> getMyReviews(
//            @AuthenticationPrincipal User user
//    ) {
//        if (user == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//
//        String userId = user.getUsername();
//
//        return ResponseEntity.ok(reviewService.getReviewsByUserId(userId));
//    }
//
//    // ==========================================
//    // 4. UPDATE REVIEW (ONLY OWNER)
//    // ==========================================
//    @PutMapping("/{id}")
//    public ResponseEntity<?> updateReview(
//            @PathVariable String id,
//            @RequestBody Review updatedReview,
//            @AuthenticationPrincipal User user
//    ) {
//        if (user == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//
//        try {
//            Review review = reviewService.updateReviewSecure(
//                    id,
//                    updatedReview,
//                    user.getUsername() // 🔥 ownership check
//            );
//            return ResponseEntity.ok(review);
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
//        }
//    }
//
//    // ==========================================
//    // 5. DELETE REVIEW (ONLY OWNER)
//    // ==========================================
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> deleteReview(
//            @PathVariable String id,
//            @AuthenticationPrincipal User user
//    ) {
//        if (user == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//
//        try {
//            reviewService.deleteReviewSecure(id, user.getUsername());
//            return ResponseEntity.noContent().build();
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
//        }
//    }
//}

package com.shopeasy.reviewservice.controller;

import com.shopeasy.reviewservice.model.Review;
import com.shopeasy.reviewservice.response.ApiResponse;
import com.shopeasy.reviewservice.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Review Microservice
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // ==========================================
    // 1. CREATE REVIEW (JWT REQUIRED)
    // ==========================================
    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(
            @RequestBody Review review,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", null));
        }

        review.setUserId(user.getUsername());

        Review savedReview = reviewService.addReview(review);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created successfully", savedReview));
    }

    // ==========================================
    // 2. GET REVIEWS BY PRODUCT (PUBLIC)
    // ==========================================
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByProduct(
            @PathVariable String productId
    ) {
        List<Review> reviews = reviewService.getReviewsByProductId(productId);

        return ResponseEntity.ok(
                ApiResponse.success("Reviews fetched successfully", reviews)
        );
    }

    // ==========================================
    // 3. GET MY REVIEWS (JWT REQUIRED)
    // ==========================================
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Review>>> getMyReviews(
            @AuthenticationPrincipal User user
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", null));
        }

        String userId = user.getUsername();
        List<Review> reviews = reviewService.getReviewsByUserId(userId);

        return ResponseEntity.ok(
                ApiResponse.success("User reviews fetched successfully", reviews)
        );
    }

    // ==========================================
    // 4. UPDATE REVIEW (ONLY OWNER)
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateReview(
            @PathVariable String id,
            @RequestBody Review updatedReview,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", null));
        }

        try {
            Review review = reviewService.updateReviewSecure(
                    id,
                    updatedReview,
                    user.getUsername()
            );

            return ResponseEntity.ok(
                    ApiResponse.success("Review updated successfully", review)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage(), null));
        }
    }

    // ==========================================
    // 5. DELETE REVIEW (ONLY OWNER)
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable String id,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", null));
        }

        try {
            reviewService.deleteReviewSecure(id, user.getUsername());

            return ResponseEntity.ok(
                    ApiResponse.success("Review deleted successfully", null)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage(), null));
        }
    }
}