//package com.shopeasy.reviewservice.service;
//
//import com.shopeasy.reviewservice.model.Review;
//import com.shopeasy.reviewservice.repository.ReviewRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
///**
// * Service layer for handling Review business logic.
// */
//@Service
//public class ReviewService {
//
//    @Autowired
//    private ReviewRepository reviewRepository;
//
//    // ==========================================
//    // 1. CREATE
//    // ==========================================
//    public Review addReview(Review review) {
//        // Saves the new review to MongoDB.
//        // @CreatedDate in the model will automatically generate the timestamp.
//        return reviewRepository.save(review);
//    }
//
//    // ==========================================
//    // 2. READ
//    // ==========================================
//    public List<Review> getReviewsByProductId(String productId) {
//        // Uses the custom repository method we made to fetch reviews, newest first!
//        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
//    }
//
//    public List<Review> getReviewsByUserId(String userId) {
//        return reviewRepository.findByUserId(userId);
//    }
//
//    // ==========================================
//    // 3. UPDATE
//    // ==========================================
//    public Review updateReview(String id, Review updatedReview) {
//        // First, check if the review actually exists in the database
//        Optional<Review> existingReviewOpt = reviewRepository.findById(id);
//
//        if (existingReviewOpt.isPresent()) {
//            Review existingReview = existingReviewOpt.get();
//
//            // Only update the fields the user is allowed to change
//            existingReview.setRating(updatedReview.getRating());
//            existingReview.setComment(updatedReview.getComment());
//
//            // Save it back. @LastModifiedDate in the model will automatically update!
//            return reviewRepository.save(existingReview);
//        } else {
//            // In a real-world app, you would throw a custom Exception here
//            throw new RuntimeException("Review not found with id: " + id);
//        }
//    }
//
//    // ==========================================
//    // 4. DELETE
//    // ==========================================
//    public void deleteReview(String id) {
//        reviewRepository.deleteById(id);
//    }
//}

//package com.shopeasy.reviewservice.service;
//
//import com.shopeasy.reviewservice.model.Review;
//import com.shopeasy.reviewservice.repository.ReviewRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.List;
//import java.util.Optional;
//
///**
// * Service layer for handling Review business logic.
// */
//@Service
//public class ReviewService {
//
//    @Autowired
//    private ReviewRepository reviewRepository;
//
//    @Autowired
//    private RestTemplate restTemplate;
//
//    // ==========================================
//    // 🔥 PRODUCT VALIDATION METHOD
//    // ==========================================
//    private boolean isProductValid(String productId) {
//        try {
//            String url = "http://localhost:8084/api/product/" + productId;
//
//            System.out.println("Calling: " + url); // DEBUG
//
//            ResponseEntity<Object> response =
//                    restTemplate.getForEntity(url, Object.class);
//
//            System.out.println("Response: " + response.getStatusCode()); // DEBUG
//
//            return response.getStatusCode().is2xxSuccessful();
//
//        } catch (Exception e) {
//            e.printStackTrace(); // 🔥 VERY IMPORTANT
//            return false;
//        }
//    }
//
//    // ==========================================
//    // 1. CREATE
//    // ==========================================
//    public Review addReview(Review review) {
//
//        // 🔥 Validate product before saving
//        if (!isProductValid(review.getProductId())) {
//            throw new RuntimeException("Invalid product ID");
//        }
//
//        // Optional: validate rating (extra quality)
//        if (review.getRating() < 1 || review.getRating() > 5) {
//            throw new RuntimeException("Rating must be between 1 and 5");
//        }
//
//        // Save review
//        return reviewRepository.save(review);
//    }
//
//    // ==========================================
//    // 2. READ
//    // ==========================================
//    public List<Review> getReviewsByProductId(String productId) {
//        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
//    }
//
//    public List<Review> getReviewsByUserId(String userId) {
//        return reviewRepository.findByUserId(userId);
//    }
//
//    // ==========================================
//    // 3. UPDATE
//    // ==========================================
//    public Review updateReview(String id, Review updatedReview) {
//
//        Optional<Review> existingReviewOpt = reviewRepository.findById(id);
//
//        if (existingReviewOpt.isPresent()) {
//            Review existingReview = existingReviewOpt.get();
//
//            // Update only allowed fields
//            existingReview.setRating(updatedReview.getRating());
//            existingReview.setComment(updatedReview.getComment());
//
//            return reviewRepository.save(existingReview);
//        } else {
//            throw new RuntimeException("Review not found with id: " + id);
//        }
//    }
//
//    // ==========================================
//    // 4. DELETE
//    // ==========================================
//    public void deleteReview(String id) {
//
//        if (!reviewRepository.existsById(id)) {
//            throw new RuntimeException("Review not found with id: " + id);
//        }
//
//        reviewRepository.deleteById(id);
//    }
//}


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