package com.shopeasy.orderservice.client.impl;

import com.shopeasy.orderservice.client.DeliveryServiceClient;
import com.shopeasy.orderservice.config.ExternalServicesProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryServiceClientStub implements DeliveryServiceClient {

    private final ExternalServicesProperties properties;

    @Override
    public void sendOrderToDelivery(String orderId) {
        log.info("DeliveryService stub call: baseUrl={}, orderId={}",
                properties.getDelivery().getBaseUrl(), orderId);
    }
}
