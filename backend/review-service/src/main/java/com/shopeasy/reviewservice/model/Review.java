package com.shopeasy.reviewservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;

/**
 * Professional real-world entity for a user product review.
 */
@Document(collection = "reviews") // 1. Defines the MongoDB collection
@Data // 2. Lombok generates Getters, Setters, toString, etc.
@NoArgsConstructor // 3. Creates an empty constructor for Spring
@AllArgsConstructor // 4. Creates a full constructor for testing
public class Review {

    @Id
    private String id; // The primary key (_id) in MongoDB

    @Field("user_id") // Maps to 'user_id' in the JSON, professional naming.
    @Indexed // 5. Crucial for real-world performance when fetching user-specific reviews.
    private String userId; // Connects to the User who made the review

    @Field("product_id") // Maps to 'product_id' in JSON.
    @Indexed // 6. Also indexed, to quickly load all reviews for a specific item.
    private String productId; // Connects to the Product being reviewed

    @Min(value = 1, message = "Rating must be at least 1") // 7. Validation is a real-world requirement.
    @Max(value = 5, message = "Rating cannot exceed 5")
    private int rating; // The star rating (1-5 or 1-10)

    private String comment; // The text of the review (optional, but realistic)

    @CreatedDate // 8. Spring Data automatically populates this when the review is created.
    @Field("created_at")
    private Instant createdAt; // Using 'Instant' is modern professional practice for precise timestamps.

    @LastModifiedDate // 9. Also automatically updated, standard for realistic models.
    @Field("updated_at")
    private Instant updatedAt;
}