
package com.shopeasy.reviewservice.service;

import com.shopeasy.reviewservice.model.Review;
import com.shopeasy.reviewservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Service layer for Review business logic
 */
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RestTemplate restTemplate;

    // ==========================================
    // 🔥 PRODUCT VALIDATION (CALL PRODUCT SERVICE)
    // ==========================================
    private boolean isProductValid(String productId) {
        try {
            String url = "http://localhost:8084/api/product/" + productId;

            ResponseEntity<Object> response =
                    restTemplate.getForEntity(url, Object.class);

            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            System.out.println("Product validation failed: " + e.getMessage());
            return false;
        }
    }

    // ==========================================
    // 1. CREATE REVIEW
    // ==========================================
    public Review addReview(Review review) {

        // 🔥 Validate product
        if (!isProductValid(review.getProductId())) {
            throw new RuntimeException("Invalid product ID");
        }

        // 🔥 Validate rating
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        // 🔥 Optional: prevent duplicate review (same user + product)
        boolean exists = reviewRepository
                .existsByUserIdAndProductId(review.getUserId(), review.getProductId());

        if (exists) {
            throw new RuntimeException("You have already reviewed this product");
        }

        return reviewRepository.save(review);
    }

    // ==========================================
    // 2. READ REVIEWS
    // ==========================================
    public List<Review> getReviewsByProductId(String productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<Review> getReviewsByUserId(String userId) {
        return reviewRepository.findByUserId(userId);
    }

    // ==========================================
    // 3. UPDATE (SECURE - OWNER ONLY)
    // ==========================================
    public Review updateReviewSecure(String id, Review updatedReview, String userId) {

        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // 🔥 Ownership check
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("You can only update your own review");
        }

        // Update allowed fields
        existing.setRating(updatedReview.getRating());
        existing.setComment(updatedReview.getComment());

        return reviewRepository.save(existing);
    }

    // ==========================================
    // 4. DELETE (SECURE - OWNER ONLY)
    // ==========================================
    public void deleteReviewSecure(String id, String userId) {

        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // 🔥 Ownership check
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own review");
        }

        reviewRepository.deleteById(id);
    }
}