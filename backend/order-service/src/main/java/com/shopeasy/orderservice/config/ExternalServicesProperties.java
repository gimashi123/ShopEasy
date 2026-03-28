package com.shopeasy.orderservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "services")
public class ExternalServicesProperties {

    private ServiceEndpoint product = new ServiceEndpoint();
    private ServiceEndpoint supermarket = new ServiceEndpoint();
    private ServiceEndpoint promotion = new ServiceEndpoint();
    private ServiceEndpoint delivery = new ServiceEndpoint();
    private ServiceEndpoint notification = new ServiceEndpoint();

    @Data
    public static class ServiceEndpoint {
        private String baseUrl;
    }
}
