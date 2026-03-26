package com.shopeasy.deliveryservice.service;

import com.shopeasy.deliveryservice.dto.DriverRequest;
import com.shopeasy.deliveryservice.dto.DriverResponse;
import com.shopeasy.deliveryservice.model.Driver;
import com.shopeasy.deliveryservice.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {
    private final DriverRepository driverRepository;

    public DriverResponse createDriver(DriverRequest request) {
        Driver driver = Driver.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .vehicleType(request.getVehicleType())
                .licenseNumber(request.getLicenseNumber())
                .build();
        return mapToResponse(driverRepository.save(driver));
    }

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DriverResponse> getAvailableDrivers() {
        return driverRepository.findByAvailableTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DriverResponse getDriverById(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
        return mapToResponse(driver);
    }

    public DriverResponse updateDriver(String id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
        
        driver.setName(request.getName());
        driver.setPhone(request.getPhone());
        driver.setEmail(request.getEmail());
        driver.setVehicleType(request.getVehicleType());
        driver.setLicenseNumber(request.getLicenseNumber());
        
        return mapToResponse(driverRepository.save(driver));
    }

    public void deleteDriver(String id) {
        driverRepository.deleteById(id);
    }

    private DriverResponse mapToResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .vehicleType(driver.getVehicleType())
                .licenseNumber(driver.getLicenseNumber())
                .available(driver.isAvailable())
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}
