package com.shopeasy.supermarketservice.controller;

import com.shopeasy.common.response.ApiResponse;
import com.shopeasy.supermarketservice.dto.SupermarketRequest;
import com.shopeasy.supermarketservice.dto.SupermarketResponse;
import com.shopeasy.supermarketservice.service.SupermarketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supermarkets")
@RequiredArgsConstructor
public class SupermarketController {

    private final SupermarketService supermarketService;

    @PostMapping
    public ResponseEntity<ApiResponse<SupermarketResponse>> create(
            @Valid @RequestBody SupermarketRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Supermarket created successfully", supermarketService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupermarketResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success("Supermarkets retrieved successfully", supermarketService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupermarketResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.success("Supermarket retrieved successfully", supermarketService.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupermarketResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody SupermarketRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Supermarket updated successfully", supermarketService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        supermarketService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Supermarket deleted successfully", null));
    }
}
