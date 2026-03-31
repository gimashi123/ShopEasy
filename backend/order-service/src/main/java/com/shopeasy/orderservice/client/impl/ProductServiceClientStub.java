package com.shopeasy.orderservice.client.impl;

import java.math.BigDecimal;
import java.util.Map;

import com.shopeasy.orderservice.client.ProductServiceClient;
import com.shopeasy.orderservice.client.dto.ProductInfo;
import com.shopeasy.orderservice.config.ExternalServicesProperties;
import com.shopeasy.orderservice.exception.DownstreamServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceClientStub implements ProductServiceClient {

    private final ExternalServicesProperties properties;
    private final RestClient restClient = RestClient.create();

    @Override
    public ProductInfo getProductById(String productId) {
        String baseUrl = properties.getProduct().getBaseUrl();
        log.info("ProductService call: baseUrl={}, productId={}", baseUrl, productId);

        try {
            JsonNode root = restClient.get()
                    .uri(baseUrl + "/api/product/{id}", productId)
                    .retrieve()
                    .body(JsonNode.class);

            JsonNode payload = root != null && root.has("data") ? root.get("data") : root;
            if (payload == null || payload.isMissingNode()) {
                throw new DownstreamServiceException("Product-service returned an empty response for id: " + productId);
            }

            BigDecimal price = payload.hasNonNull("price")
                    ? new BigDecimal(payload.get("price").asText("0"))
                    : BigDecimal.ZERO;

            return ProductInfo.builder()
                    .id(payload.path("id").asText(productId))
                    .name(payload.path("name").asText("Unknown Product"))
                    .unitPrice(price)
                    .available(payload.path("available").asBoolean(false))
                    .build();
        } catch (Exception ex) {
            throw new DownstreamServiceException("Failed to fetch product from product-service for id: " + productId, ex);
        }
    }

    @Override
    public void reduceInventory(String productId, String supermarketId, Integer quantity) {
        String baseUrl = properties.getProduct().getBaseUrl();
        log.info("ProductService inventory reduction call: baseUrl={}, productId={}, supermarketId={}, quantity={}",
                baseUrl, productId, supermarketId, quantity);

        try {
            restClient.patch()
                    .uri(baseUrl + "/api/product/{id}/inventory/reduce", productId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("supermarketId", supermarketId, "quantity", quantity))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            throw new DownstreamServiceException(
                    "Failed to reduce inventory for productId=%s, supermarketId=%s".formatted(productId, supermarketId),
                    ex
            );
        }
    }
}
