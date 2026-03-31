package com.shopeasy.orderservice.client.impl;
 
import com.shopeasy.orderservice.client.DeliveryServiceClient;
import com.shopeasy.orderservice.config.ExternalServicesProperties;
import com.shopeasy.orderservice.exception.DownstreamServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.Map;
 
@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryServiceClientImpl implements DeliveryServiceClient {
 
    private final ExternalServicesProperties properties;
    private final RestClient restClient = RestClient.create();
 
    @Override
    public void createTask(String orderId, String deliveryAddress) {
        String baseUrl = properties.getDelivery().getBaseUrl();
        log.info("Creating delivery task: baseUrl={}, orderId={}, address={}", baseUrl, orderId, deliveryAddress);
 
        try {
            restClient.post()
                    .uri(baseUrl + "/api/delivery/tasks")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "orderId", orderId,
                            "deliveryAddress", deliveryAddress
                    ))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Delivery task created successfully for orderId={}", orderId);
        } catch (Exception ex) {
            log.error("Failed to create delivery task for orderId={}: {}", orderId, ex.getMessage());
            // We log but don't обязательно throw to avoid failing the order creation 
            // if the delivery service is just temporarily down. 
            // However, following the project pattern:
            throw new DownstreamServiceException("Failed to notify delivery-service for orderId: " + orderId, ex);
        }
    }
}
