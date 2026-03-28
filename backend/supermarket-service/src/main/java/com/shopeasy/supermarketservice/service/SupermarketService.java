package com.shopeasy.supermarketservice.service;

import com.shopeasy.common.exception.ResourceNotFoundException;
import com.shopeasy.supermarketservice.dto.SupermarketRequest;
import com.shopeasy.supermarketservice.dto.SupermarketResponse;
import com.shopeasy.supermarketservice.model.Supermarket;
import com.shopeasy.supermarketservice.repository.SupermarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupermarketService {

    private final SupermarketRepository supermarketRepository;

    public SupermarketResponse create(SupermarketRequest request) {
        Supermarket supermarket = Supermarket.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .openingHours(request.getOpeningHours())
                .location(mapLocation(request.getLocation()))
                .build();

        return SupermarketResponse.from(supermarketRepository.save(supermarket));
    }

    public List<SupermarketResponse> getAll() {
        return supermarketRepository.findAll()
                .stream()
                .map(SupermarketResponse::from)
                .toList();
    }

    public SupermarketResponse getById(String id) {
        return SupermarketResponse.from(findById(id));
    }

    public SupermarketResponse update(String id, SupermarketRequest request) {
        Supermarket supermarket = findById(id);

        supermarket.setName(request.getName());
        supermarket.setAddress(request.getAddress());
        supermarket.setPhone(request.getPhone());
        supermarket.setEmail(request.getEmail());
        supermarket.setOpeningHours(request.getOpeningHours());
        supermarket.setLocation(mapLocation(request.getLocation()));
        supermarket.setUpdatedAt(Instant.now());

        return SupermarketResponse.from(supermarketRepository.save(supermarket));
    }

    public void delete(String id) {
        Supermarket supermarket = findById(id);
        supermarketRepository.delete(supermarket);
    }

    private Supermarket findById(String id) {
        return supermarketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supermarket not found with id: " + id));
    }

    private Supermarket.Location mapLocation(SupermarketRequest.LocationDto dto) {
        if (dto == null) return null;
        return new Supermarket.Location(dto.getLat(), dto.getLng());
    }
}
