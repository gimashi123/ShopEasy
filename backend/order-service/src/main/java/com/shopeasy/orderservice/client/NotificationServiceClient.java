package com.shopeasy.orderservice.client;

import com.shopeasy.orderservice.model.OrderStatus;

public interface NotificationServiceClient {

    void sendOrderStatusNotification(String orderId, String customerId, OrderStatus status);
}
