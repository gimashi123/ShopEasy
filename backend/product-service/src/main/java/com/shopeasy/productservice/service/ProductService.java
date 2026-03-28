package com.shopeasy.productservice.service;

import com.shopeasy.common.exception.ConflictException;
import com.shopeasy.common.exception.ResourceNotFoundException;
import com.shopeasy.productservice.dto.ProductRequest;
import com.shopeasy.productservice.dto.ProductResponse;
import com.shopeasy.productservice.model.Product;
import com.shopeasy.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

/**
 * Contains the business logic for product CRUD operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    public ProductResponse createProduct(ProductRequest request) {
        return createProduct(request, null);
    }

    public ProductResponse createProduct(ProductRequest request, MultipartFile imageFile) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new ConflictException("Product", "sku", request.getSku());
        }

        Instant now = Instant.now();
        Product product = Product.builder()
                .sku(request.getSku().trim())
                .name(request.getName().trim())
                .description(request.getDescription())
                .category(request.getCategory())
                .brand(request.getBrand())
                .supermarketId(request.getSupermarketId().trim())
                .imageUrl(resolveImagePath(request.getImageUrl(), imageFile, null))
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .available(request.getQuantity() > 0)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Created product: id={}, sku={}", savedProduct.getId(), savedProduct.getSku());
        return mapToResponse(savedProduct);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProductResponse getProductById(String id) {
        Product product = findProductById(id);
        return mapToResponse(product);
    }

    /**
     * Allows downstream services to fetch all products owned by one supermarket.
     */
    public List<ProductResponse> getProductsBySupermarketId(String supermarketId) {
        return productRepository.findAllBySupermarketId(supermarketId.trim())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Useful for downstream services that know the SKU rather than the MongoDB id.
     */
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));
        return mapToResponse(product);
    }

    /**
     * Lightweight existence check for other services before they store a productId reference.
     */
    public boolean productExists(String id) {
        return productRepository.existsById(id);
    }

    public ProductResponse updateProduct(String id, ProductRequest request) {
        return updateProduct(id, request, null);
    }

    public ProductResponse updateProduct(String id, ProductRequest request, MultipartFile imageFile) {
        Product existingProduct = findProductById(id);

        // Protect SKU uniqueness when a product is updated.
        if (!existingProduct.getSku().equals(request.getSku().trim())
                && productRepository.existsBySku(request.getSku().trim())) {
            throw new ConflictException("Product", "sku", request.getSku());
        }

        existingProduct.setSku(request.getSku().trim());
        existingProduct.setName(request.getName().trim());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setCategory(request.getCategory());
        existingProduct.setBrand(request.getBrand());
        existingProduct.setSupermarketId(request.getSupermarketId().trim());
        existingProduct.setImageUrl(resolveImagePath(request.getImageUrl(), imageFile, existingProduct.getImageUrl()));
        existingProduct.setPrice(request.getPrice());
        existingProduct.setQuantity(request.getQuantity());
        existingProduct.setAvailable(request.getQuantity() > 0);
        existingProduct.setUpdatedAt(Instant.now());

        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Updated product: id={}, sku={}", updatedProduct.getId(), updatedProduct.getSku());
        return mapToResponse(updatedProduct);
    }

    public void deleteProduct(String id) {
        Product product = findProductById(id);
        productRepository.delete(product);
        fileStorageService.deleteImage(product.getImageUrl());
        log.info("Deleted product: id={}, sku={}", product.getId(), product.getSku());
    }

    private Product findProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory())
                .brand(product.getBrand())
                .supermarketId(product.getSupermarketId())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .available(product.getAvailable())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private String resolveImagePath(String imageUrl, MultipartFile imageFile, String currentImageUrl) {
        if (imageFile != null && !imageFile.isEmpty()) {
            fileStorageService.deleteImage(currentImageUrl);
            return fileStorageService.storeImage(imageFile);
        }

        if (StringUtils.hasText(imageUrl)) {
            String cleanedImageUrl = imageUrl.trim();

            // If the admin switches from a local upload to a link, delete the old file.
            if (!cleanedImageUrl.equals(currentImageUrl)) {
                fileStorageService.deleteImage(currentImageUrl);
            }

            return cleanedImageUrl;
        }

        return currentImageUrl;
    }
}
