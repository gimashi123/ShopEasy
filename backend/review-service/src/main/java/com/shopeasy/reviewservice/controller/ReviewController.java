package com.shopeasy.reviewservice.controller;

import com.shopeasy.reviewservice.model.Review;
import com.shopeasy.reviewservice.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for the Review Microservice.
 * Handles incoming HTTP requests for CRUD operations.
 */
@RestController // 1. Tells Spring this class handles REST API requests
@RequestMapping("/api/reviews") // 2. The base URL for all endpoints in this class
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // ==========================================
    // 1. CREATE (POST)
    // URL: POST http://localhost:8088/api/reviews
    // ==========================================
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        Review savedReview = reviewService.addReview(review);
        // Returns a 201 Created status, which is the professional standard for POST requests
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }

    // ==========================================
    // 2. READ (GET)
    // URL: GET http://localhost:8088/api/reviews/product/{productId}
    // ==========================================
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable String productId) {
        List<Review> reviews = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(reviews); // Returns 200 OK
    }

    // URL: GET http://localhost:8088/api/reviews/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUser(@PathVariable String userId) {
        List<Review> reviews = reviewService.getReviewsByUserId(userId);
        return ResponseEntity.ok(reviews);
    }

    // ==========================================
    // 3. UPDATE (PUT)
    // URL: PUT http://localhost:8088/api/reviews/{id}
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
            @PathVariable String id,
            @RequestBody Review updatedReview) {

        try {
            Review review = reviewService.updateReview(id, updatedReview);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            // If the review ID doesn't exist, return a 404 Not Found status
            return ResponseEntity.notFound().build();
        }
    }

    // ==========================================
    // 4. DELETE (DELETE)
    // URL: DELETE http://localhost:8088/api/reviews/{id}
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        // Returns 204 No Content, which is standard for a successful delete operation
        return ResponseEntity.noContent().build();
    }
}
