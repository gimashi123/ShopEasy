package com.shopeasy.reviewservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Main application class for the Review Microservice.
 */
@SpringBootApplication
@EnableMongoAuditing // 🔥 This turns on the automatic createdAt/updatedAt timestamps!
public class ReviewServiceApplication {

    public static void main(String[] args) {
        // This line tells Spring Boot to start up the embedded Tomcat server
        // and initialize all your Controllers, Services, and Repositories.
        SpringApplication.run(ReviewServiceApplication.class, args);

        System.out.println("⭐⭐⭐⭐⭐ Review & Rating Service is up and running! ⭐⭐⭐⭐⭐");
    }
}