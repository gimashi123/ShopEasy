package com.shopeasy.supermarketservice.repository;

import com.shopeasy.supermarketservice.model.Supermarket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupermarketRepository extends MongoRepository<Supermarket, String> {

    List<Supermarket> findByActiveTrue();

    boolean existsByName(String name);
}
