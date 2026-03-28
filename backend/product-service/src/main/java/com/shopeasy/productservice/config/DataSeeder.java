package com.shopeasy.productservice.config;

import com.shopeasy.productservice.model.Product;
import com.shopeasy.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Adds a few demo records when the product collection is empty.
 * This helps during demos and Postman testing.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }

        Instant now = Instant.now();
        List<Product> sampleProducts = List.of(
                Product.builder()
                        .sku("MILK-001")
                        .name("Fresh Milk 1L")
                        .description("Daily fresh full cream milk.")
                        .category("Dairy")
                        .brand("ShopEasy Fresh")
                        .imageUrl("https://example.com/images/fresh-milk-1l.jpg")
                        .price(new BigDecimal("450.00"))
                        .quantity(100)
                        .available(true)
                        .createdAt(now)
                        .updatedAt(now)
                        .build(),
                Product.builder()
                        .sku("RICE-001")
                        .name("Basmati Rice 5kg")
                        .description("Premium quality basmati rice.")
                        .category("Grocery")
                        .brand("Golden Harvest")
                        .imageUrl("https://example.com/images/basmati-rice-5kg.jpg")
                        .price(new BigDecimal("2450.00"))
                        .quantity(50)
                        .available(true)
                        .createdAt(now)
                        .updatedAt(now)
                        .build(),
                Product.builder()
                        .sku("BREAD-001")
                        .name("Whole Wheat Bread")
                        .description("Soft and healthy whole wheat bread.")
                        .category("Bakery")
                        .brand("Daily Bake")
                        .imageUrl("https://example.com/images/whole-wheat-bread.jpg")
                        .price(new BigDecimal("220.00"))
                        .quantity(0)
                        .available(false)
                        .createdAt(now)
                        .updatedAt(now)
                        .build()
        );

        productRepository.saveAll(sampleProducts);
        log.info("Seeded {} sample products", sampleProducts.size());
    }
}
