package com.shopeasy.orderservice.client;

import com.shopeasy.orderservice.client.dto.PromotionInfo;

public interface PromotionServiceClient {

    PromotionInfo getPromotionByProductId(String productId);
}
