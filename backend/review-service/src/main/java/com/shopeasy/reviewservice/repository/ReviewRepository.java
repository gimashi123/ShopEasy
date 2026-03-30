package com.shopeasy.reviewservice.repository;

import com.shopeasy.reviewservice.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data MongoDB Repository for managing the 'reviews' collection.
 */
@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    // 1. Find reviews by user
    List<Review> findByUserId(String userId);

    // 2. Find reviews by product (latest first)
    List<Review> findByProductIdOrderByCreatedAtDesc(String productId);

    // 3. Count 5-star reviews
    long countByProductIdAndRating(String productId, int rating);

    // 🔥 ADD THIS METHOD (IMPORTANT)
    boolean existsByUserIdAndProductId(String userId, String productId);
}