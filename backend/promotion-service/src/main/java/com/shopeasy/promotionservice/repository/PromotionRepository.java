package com.shopeasy.promotionservice.repository;

import com.shopeasy.promotionservice.model.Promotion;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for Promotion documents.
 */
public interface PromotionRepository extends MongoRepository<Promotion, String> {

    /** Find all promotions for a specific product. */
    List<Promotion> findByProductId(String productId);

    /** Find all active promotions. */
    List<Promotion> findByActiveTrue();

    /** Find an active promotion for a specific product. */
    Optional<Promotion> findFirstByProductIdAndActiveTrue(String productId);

    /** Find an active global promotion (productId is null). */
    Optional<Promotion> findFirstByProductIdIsNullAndActiveTrue();
}
