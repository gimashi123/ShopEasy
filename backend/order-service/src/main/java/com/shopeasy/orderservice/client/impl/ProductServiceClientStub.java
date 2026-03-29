package com.shopeasy.orderservice.client.impl;

import java.math.BigDecimal;

import com.shopeasy.orderservice.client.ProductServiceClient;
import com.shopeasy.orderservice.client.dto.ProductInfo;
import com.shopeasy.orderservice.config.ExternalServicesProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceClientStub implements ProductServiceClient {

    private final ExternalServicesProperties properties;

    @Override
    public ProductInfo getProductById(String productId) {
        log.info("ProductService stub call: baseUrl={}, productId={}",
                properties.getProduct().getBaseUrl(), productId);

        return ProductInfo.builder()
                .id(productId)
                .name("Stub Product")
                .unitPrice(BigDecimal.ZERO)
                .available(true)
                .build();
    }
}
