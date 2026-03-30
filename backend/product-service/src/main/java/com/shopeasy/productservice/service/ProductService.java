package com.shopeasy.productservice.service;

import com.shopeasy.common.exception.BadRequestException;
import com.shopeasy.common.exception.ConflictException;
import com.shopeasy.common.exception.ResourceNotFoundException;
import com.shopeasy.productservice.dto.InventoryReductionRequest;
import com.shopeasy.productservice.dto.ProductInventoryRequest;
import com.shopeasy.productservice.dto.ProductInventoryResponse;
import com.shopeasy.productservice.dto.ProductRequest;
import com.shopeasy.productservice.dto.ProductResponse;
import com.shopeasy.productservice.model.Product;
import com.shopeasy.productservice.model.ProductInventory;
import com.shopeasy.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Contains the business logic for product CRUD operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new ConflictException("Product", "sku", request.getSku());
        }

        Instant now = Instant.now();
        List<ProductInventory> inventories = normalizeInventories(request.getInventories());
        Product product = Product.builder()
                .sku(request.getSku().trim())
                .name(request.getName().trim())
                .description(request.getDescription())
                .category(request.getCategory())
                .brand(request.getBrand())
                .imageUrl(normalizeImageUrl(request.getImageUrl()))
                .price(request.getPrice())
                .inventories(inventories)
                .available(isAvailable(inventories))
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
        return productRepository.findAllByInventoriesSupermarketId(supermarketId.trim())
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

    /**
     * Reduces stock for one supermarket when an order is placed.
     */
    public ProductResponse reduceInventory(String id, InventoryReductionRequest request) {
        Product product = findProductById(id);
        String targetSupermarketId = request.getSupermarketId().trim();

        ProductInventory inventory = product.getInventories().stream()
                .filter(entry -> entry.getSupermarketId().equals(targetSupermarketId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product inventory", "supermarketId", targetSupermarketId));

        if (inventory.getQuantity() < request.getQuantity()) {
            throw new BadRequestException("Not enough stock available for the requested supermarket");
        }

        inventory.setQuantity(inventory.getQuantity() - request.getQuantity());
        product.setAvailable(isAvailable(product.getInventories()));
        product.setUpdatedAt(Instant.now());

        Product updatedProduct = productRepository.save(product);
        log.info("Reduced stock: productId={}, supermarketId={}, reducedBy={}",
                updatedProduct.getId(), targetSupermarketId, request.getQuantity());
        return mapToResponse(updatedProduct);
    }

    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product existingProduct = findProductById(id);

        // Protect SKU uniqueness when a product is updated.
        if (!existingProduct.getSku().equals(request.getSku().trim())
                && productRepository.existsBySku(request.getSku().trim())) {
            throw new ConflictException("Product", "sku", request.getSku());
        }

        List<ProductInventory> inventories = normalizeInventories(request.getInventories());
        existingProduct.setSku(request.getSku().trim());
        existingProduct.setName(request.getName().trim());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setCategory(request.getCategory());
        existingProduct.setBrand(request.getBrand());
        existingProduct.setImageUrl(normalizeImageUrl(request.getImageUrl()));
        existingProduct.setPrice(request.getPrice());
        existingProduct.setInventories(inventories);
        existingProduct.setAvailable(isAvailable(inventories));
        existingProduct.setUpdatedAt(Instant.now());

        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Updated product: id={}, sku={}", updatedProduct.getId(), updatedProduct.getSku());
        return mapToResponse(updatedProduct);
    }

    public void deleteProduct(String id) {
        Product product = findProductById(id);
        productRepository.delete(product);
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
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .inventories(mapInventoryResponses(product.getInventories()))
                .totalQuantity(calculateTotalQuantity(product.getInventories()))
                .available(product.getAvailable())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private List<ProductInventory> normalizeInventories(List<ProductInventoryRequest> inventoryRequests) {
        Set<String> supermarketIds = inventoryRequests.stream()
                .map(entry -> entry.getSupermarketId().trim())
                .collect(Collectors.toSet());

        if (supermarketIds.size() != inventoryRequests.size()) {
            throw new BadRequestException("Each supermarketId can appear only once in inventories");
        }

        return inventoryRequests.stream()
                .map(entry -> ProductInventory.builder()
                        .supermarketId(entry.getSupermarketId().trim())
                        .quantity(entry.getQuantity())
                        .build())
                .toList();
    }

    private List<ProductInventoryResponse> mapInventoryResponses(List<ProductInventory> inventories) {
        return inventories.stream()
                .map(entry -> ProductInventoryResponse.builder()
                        .supermarketId(entry.getSupermarketId())
                        .quantity(entry.getQuantity())
                        .build())
                .toList();
    }

    private boolean isAvailable(List<ProductInventory> inventories) {
        return inventories.stream().anyMatch(entry -> entry.getQuantity() > 0);
    }

    private int calculateTotalQuantity(List<ProductInventory> inventories) {
        return inventories.stream()
                .mapToInt(ProductInventory::getQuantity)
                .sum();
    }

    private String normalizeImageUrl(String imageUrl) {
        if (StringUtils.hasText(imageUrl)) {
            return imageUrl.trim();
        }

        return null;
    }
}
