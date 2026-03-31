package com.shopeasy.deliveryservice.controller;

import com.shopeasy.deliveryservice.dto.DriverRequest;
import com.shopeasy.deliveryservice.dto.DriverResponse;
import com.shopeasy.deliveryservice.service.DriverService;
import com.shopeasy.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery/drivers")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<ApiResponse<DriverResponse>> createDriver(@Valid @RequestBody DriverRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Driver created successfully", driverService.createDriver(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAllDrivers() {
        return ResponseEntity.ok(ApiResponse.success("Drivers retrieved successfully", driverService.getAllDrivers()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAvailableDrivers() {
        return ResponseEntity.ok(ApiResponse.success("Available drivers retrieved successfully", driverService.getAvailableDrivers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponse>> getDriverById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Driver retrieved successfully", driverService.getDriverById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponse>> updateDriver(@PathVariable String id, @Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Driver updated successfully", driverService.updateDriver(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(@PathVariable String id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(ApiResponse.success("Driver deleted successfully", null));
    }
}
