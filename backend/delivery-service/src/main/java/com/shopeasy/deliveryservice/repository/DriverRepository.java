package com.shopeasy.deliveryservice.repository;

import com.shopeasy.deliveryservice.model.Driver;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverRepository extends MongoRepository<Driver, String> {
    List<Driver> findByAvailableTrue();
}
