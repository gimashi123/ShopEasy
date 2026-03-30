package com.shopeasy.orderservice.client.impl;

import com.shopeasy.orderservice.client.NotificationServiceClient;
import com.shopeasy.orderservice.config.ExternalServicesProperties;
import com.shopeasy.orderservice.model.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceClientStub implements NotificationServiceClient {

    private final ExternalServicesProperties properties;

    @Override
    public void sendOrderStatusNotification(String orderId, String customerId, OrderStatus status) {
        log.info("NotificationService stub call: baseUrl={}, orderId={}, customerId={}, status={}",
                properties.getNotification().getBaseUrl(), orderId, customerId, status);
    }
}
