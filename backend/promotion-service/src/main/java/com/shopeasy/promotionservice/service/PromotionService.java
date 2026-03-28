package com.shopeasy.promotionservice.service;

import com.shopeasy.common.exception.BadRequestException;
import com.shopeasy.common.exception.ResourceNotFoundException;
import com.shopeasy.promotionservice.dto.*;
import com.shopeasy.promotionservice.model.Promotion;
import com.shopeasy.promotionservice.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    // ─── CREATE ───────────────────────────────────────────────────────────────

    public PromotionResponse createPromotion(CreatePromotionRequest request) {
        if (request.getDiscountPercent() < 0 || request.getDiscountPercent() > 100) {
            throw new BadRequestException("Discount percent must be between 0 and 100");
        }

        Promotion promotion = Promotion.builder()
                .name(request.getName())
                .description(request.getDescription())
                .productId(request.getProductId())
                .productName(request.getProductName())
                .supermarketName(request.getSupermarketName())
                .imageUrl(request.getImageUrl())
                .discountPercent(request.getDiscountPercent())
                .active(request.isActive())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Promotion saved = promotionRepository.save(promotion);
        log.info("Created promotion: id={}, name={}, productId={}, discount={}%",
                saved.getId(), saved.getName(), saved.getProductId(), saved.getDiscountPercent());
        return toResponse(saved);
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PromotionResponse getPromotionById(String id) {
        Promotion promotion = findOrThrow(id);
        return toResponse(promotion);
    }

    public List<PromotionResponse> getPromotionsByProductId(String productId) {
        return promotionRepository.findByProductId(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PromotionResponse> getActivePromotions() {
        return promotionRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    /**
     * Partially updates a promotion. Only provided (non-null) fields are changed.
     */
    public PromotionResponse updatePromotion(String id, UpdatePromotionRequest request) {
        Promotion promotion = findOrThrow(id);

        if (request.getDiscountPercent() != null) {
            double d = request.getDiscountPercent();
            if (d < 0 || d > 100) {
                throw new BadRequestException("Discount percent must be between 0 and 100");
            }
            promotion.setDiscountPercent(d);
        }
        if (request.getActive() != null) {
            promotion.setActive(request.getActive());
        }
        if (request.getName() != null) {
            promotion.setName(request.getName());
        }
        if (request.getDescription() != null) {
            promotion.setDescription(request.getDescription());
        }
        if (request.getProductName() != null) {
            promotion.setProductName(request.getProductName());
        }
        if (request.getSupermarketName() != null) {
            promotion.setSupermarketName(request.getSupermarketName());
        }
        if (request.getImageUrl() != null) {
            promotion.setImageUrl(request.getImageUrl());
        }

        promotion.setUpdatedAt(Instant.now());
        Promotion updated = promotionRepository.save(promotion);
        log.info("Updated promotion: id={}", updated.getId());
        return toResponse(updated);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    public void deletePromotion(String id) {
        Promotion promotion = findOrThrow(id);
        promotionRepository.delete(promotion);
        log.info("Deleted promotion: id={}", id);
    }

    // ─── APPLY DISCOUNT ───────────────────────────────────────────────────────

    /**
     * Core business logic: find an active promotion for the given productId
     * (product-specific first, then fall back to a global promotion),
     * compute the discounted final price, and return the result.
     *
     * Called by the Order Service when calculating order totals.
     */
    public ApplyDiscountResponse applyDiscount(ApplyDiscountRequest request) {
        String productId = request.getProductId();
        double originalPrice = request.getOriginalPrice();

        // 1. Try to find an active promotion specific to this product
        Optional<Promotion> promoOpt = promotionRepository.findFirstByProductIdAndActiveTrue(productId);

        // 2. Fall back to a global (product-agnostic) active promotion
        if (promoOpt.isEmpty()) {
            promoOpt = promotionRepository.findFirstByProductIdIsNullAndActiveTrue();
        }

        if (promoOpt.isPresent()) {
            Promotion promo = promoOpt.get();

            // Validate promotion date range (if set)
            Instant now = Instant.now();
            boolean withinRange =
                    (promo.getStartDate() == null || !now.isBefore(promo.getStartDate())) &&
                    (promo.getEndDate()   == null || !now.isAfter(promo.getEndDate()));

            if (withinRange) {
                double discountFraction = promo.getDiscountPercent() / 100.0;
                double finalPrice = originalPrice * (1.0 - discountFraction);

                log.info("Applied promotion '{}' ({}% off) to product {}: {} → {}",
                        promo.getName(), promo.getDiscountPercent(), productId, originalPrice, finalPrice);

                return ApplyDiscountResponse.builder()
                        .productId(productId)
                        .originalPrice(originalPrice)
                        .discountPercent(promo.getDiscountPercent())
                        .finalPrice(Math.round(finalPrice * 100.0) / 100.0)
                        .promotionId(promo.getId())
                        .promotionName(promo.getName())
                        .promotionApplied(true)
                        .build();
            }
        }

        // No active promotion found — return original price unchanged
        log.info("No active promotion found for product {}. Original price returned.", productId);
        return ApplyDiscountResponse.builder()
                .productId(productId)
                .originalPrice(originalPrice)
                .discountPercent(0)
                .finalPrice(originalPrice)
                .promotionApplied(false)
                .build();
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private Promotion findOrThrow(String id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id));
    }

    private PromotionResponse toResponse(Promotion p) {
        return PromotionResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .productId(p.getProductId())
                .productName(p.getProductName())
                .supermarketName(p.getSupermarketName())
                .imageUrl(p.getImageUrl())
                .discountPercent(p.getDiscountPercent())
                .active(p.isActive())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
