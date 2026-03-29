package com.shopeasy.orderservice.client.impl;

import com.shopeasy.orderservice.client.SupermarketServiceClient;
import com.shopeasy.orderservice.client.dto.SupermarketInfo;
import com.shopeasy.orderservice.config.ExternalServicesProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupermarketServiceClientStub implements SupermarketServiceClient {

    private final ExternalServicesProperties properties;

    @Override
    public SupermarketInfo getSupermarketById(String supermarketId) {
        log.info("SupermarketService stub call: baseUrl={}, supermarketId={}",
                properties.getSupermarket().getBaseUrl(), supermarketId);

        return SupermarketInfo.builder()
                .id(supermarketId)
                .name("Stub Supermarket")
                .active(true)
                .build();
    }
}
