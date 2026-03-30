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

    // 1. A standard custom method to find all reviews made by a single user.
    List<Review> findByUserId(String userId);

    // 2. The most critical custom method for a product page.
    // It fetches all reviews for an item, sorted so new ones appear first.
    List<Review> findByProductIdOrderByCreatedAtDesc(String productId);

    // 3. A more advanced professional query. It counts all reviews with a 5-star rating,
    // which is needed for displaying a summary like "85% five-star reviews".
    long countByProductIdAndRating(String productId, int rating);
}