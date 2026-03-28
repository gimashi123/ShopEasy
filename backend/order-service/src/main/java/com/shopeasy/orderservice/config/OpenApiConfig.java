package com.shopeasy.orderservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI orderServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ShopEasy Order Service API")
                        .description("REST API for creating and managing orders in the ShopEasy microservice system")
                        .version("v1")
                        .contact(new Contact()
                                .name("ShopEasy Backend Team")
                                .email("backend-team@shopeasy.local"))
                        .license(new License()
                                .name("Internal Use")
                                .url("https://shopeasy.local/license")))
                .addServersItem(new Server()
                        .url("http://localhost:8082")
                        .description("Direct Order Service"))
                .addServersItem(new Server()
                        .url("http://localhost:8080")
                        .description("API Gateway"));
    }
}
