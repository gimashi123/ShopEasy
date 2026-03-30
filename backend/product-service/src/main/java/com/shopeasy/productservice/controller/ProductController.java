package com.shopeasy.productservice.controller;

import com.shopeasy.common.response.ApiResponse;
import com.shopeasy.productservice.dto.InventoryReductionRequest;
import com.shopeasy.productservice.dto.ProductRequest;
import com.shopeasy.productservice.dto.ProductResponse;
import com.shopeasy.productservice.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Product CRUD APIs required by the assignment.
 */
@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {
        ProductResponse createdProduct = productService.createProduct(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", createdProduct));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        return ResponseEntity.ok(
                ApiResponse.success("Products retrieved successfully", productService.getAllProducts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.success("Product retrieved successfully", productService.getProductById(id)));
    }

    /**
     * Helps supermarket-service or the frontend list products for one supermarket.
     */
    @GetMapping("/supermarket/{supermarketId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsBySupermarketId(
            @PathVariable String supermarketId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Products retrieved successfully",
                        productService.getProductsBySupermarketId(supermarketId)
                )
        );
    }

    /**
     * This endpoint helps downstream services resolve a product by SKU when needed.
     */
    @GetMapping("/sku/{sku}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySku(@PathVariable String sku) {
        return ResponseEntity.ok(
                ApiResponse.success("Product retrieved successfully", productService.getProductBySku(sku)));
    }

    /**
     * This endpoint is useful for order-service or promotion-service to validate a product reference.
     */
    @GetMapping("/{id}/exists")
    public ResponseEntity<ApiResponse<Boolean>> productExists(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.success("Product existence checked successfully", productService.productExists(id)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Product updated successfully", productService.updateProduct(id, request)));
    }

    /**
     * Used when an order is placed and stock must be reduced for one supermarket.
     */
    @PatchMapping("/{id}/inventory/reduce")
    public ResponseEntity<ApiResponse<ProductResponse>> reduceInventory(
            @PathVariable String id,
            @Valid @RequestBody InventoryReductionRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Product inventory reduced successfully",
                        productService.reduceInventory(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
}
