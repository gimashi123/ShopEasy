package com.shopeasy.orderservice.client;

import com.shopeasy.orderservice.client.dto.ProductInfo;

public interface ProductServiceClient {

    ProductInfo getProductById(String productId);

    void reduceInventory(String productId, String supermarketId, Integer quantity);
}
