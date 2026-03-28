package com.shopeasy.orderservice.repository;

import java.util.List;

import com.shopeasy.orderservice.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByCustomerId(String customerId);

    List<Order> findBySupermarketId(String supermarketId);
}
