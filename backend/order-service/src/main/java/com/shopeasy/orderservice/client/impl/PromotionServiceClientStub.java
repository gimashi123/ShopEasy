package com.shopeasy.orderservice.client.impl;

import java.math.BigDecimal;

import com.shopeasy.orderservice.client.PromotionServiceClient;
import com.shopeasy.orderservice.client.dto.PromotionInfo;
import com.shopeasy.orderservice.config.ExternalServicesProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromotionServiceClientStub implements PromotionServiceClient {

    private final ExternalServicesProperties properties;

    @Override
    public PromotionInfo getPromotionByProductId(String productId) {
        log.info("PromotionService stub call: baseUrl={}, productId={}",
                properties.getPromotion().getBaseUrl(), productId);

        return PromotionInfo.builder()
                .productId(productId)
                .discountAmount(BigDecimal.ZERO)
                .applied(false)
                .build();
    }
}
