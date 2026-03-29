package com.shopeasy.orderservice.client.impl;

import com.shopeasy.orderservice.client.AuthServiceClient;
import com.shopeasy.orderservice.client.dto.CustomerInfo;
import com.shopeasy.orderservice.config.ExternalServicesProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceClientStub implements AuthServiceClient {

    private final ExternalServicesProperties properties;

    @Override
    public CustomerInfo getCustomerById(String customerId) {
        log.info("AuthService stub call: baseUrl={}, customerId={}",
                properties.getAuth().getBaseUrl(), customerId);

        return CustomerInfo.builder()
                .id(customerId)
                .active(true)
                .build();
    }
}
