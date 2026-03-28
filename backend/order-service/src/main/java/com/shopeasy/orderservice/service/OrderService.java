package com.shopeasy.orderservice.service;

import java.util.List;

import com.shopeasy.orderservice.dto.CreateOrderRequest;
import com.shopeasy.orderservice.dto.OrderResponse;
import com.shopeasy.orderservice.dto.UpdateOrderRequest;
import com.shopeasy.orderservice.dto.UpdateOrderStatusRequest;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(String id);

    OrderResponse updateOrder(String id, UpdateOrderRequest request);

    void deleteOrder(String id);

    OrderResponse updateOrderStatus(String id, UpdateOrderStatusRequest request);

    List<OrderResponse> getOrdersByCustomerId(String customerId);

    List<OrderResponse> getOrdersBySupermarketId(String supermarketId);
}
