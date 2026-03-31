package com.shopeasy.orderservice.client;

public interface DeliveryServiceClient {
    void createTask(String orderId, String deliveryAddress);
}
