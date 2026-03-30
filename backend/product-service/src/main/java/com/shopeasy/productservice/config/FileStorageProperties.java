package com.shopeasy.productservice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * External configuration for local image storage.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.file")
public class FileStorageProperties {

    /**
     * Base folder where uploaded product images will be saved.
     */
    private String uploadDir = "uploads/products";
}
