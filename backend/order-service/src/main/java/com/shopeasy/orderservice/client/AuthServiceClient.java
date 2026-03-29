package com.shopeasy.orderservice.client;

import com.shopeasy.orderservice.client.dto.CustomerInfo;

public interface AuthServiceClient {

    CustomerInfo getCustomerById(String customerId);
}
