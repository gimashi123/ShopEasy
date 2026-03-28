package com.shopeasy.orderservice.client;

import com.shopeasy.orderservice.client.dto.SupermarketInfo;

public interface SupermarketServiceClient {

    SupermarketInfo getSupermarketById(String supermarketId);
}
