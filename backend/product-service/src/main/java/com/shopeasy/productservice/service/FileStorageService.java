package com.shopeasy.productservice.service;

import com.shopeasy.common.exception.BadRequestException;
import com.shopeasy.productservice.config.FileStorageProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Handles storing uploaded product images on the local machine.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
    );

    private final FileStorageProperties fileStorageProperties;
    private Path uploadDirectory;

    @PostConstruct
    public void init() {
        try {
            uploadDirectory = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(uploadDirectory);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create upload directory", ex);
        }
    }

    public String storeImage(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            return null;
        }

        validateImageFile(imageFile);

        String extension = extractExtension(imageFile.getOriginalFilename());
        String generatedFileName = UUID.randomUUID() + extension;
        Path targetPath = uploadDirectory.resolve(generatedFileName).normalize();

        try {
            Files.copy(imageFile.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/products/" + generatedFileName;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store uploaded image", ex);
        }
    }

    public void deleteImage(String imagePath) {
        if (!StringUtils.hasText(imagePath) || !imagePath.startsWith("/uploads/products/")) {
            return;
        }

        String fileName = imagePath.replace("/uploads/products/", "");
        Path targetPath = uploadDirectory.resolve(fileName).normalize();

        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException ex) {
            log.warn("Failed to delete image file {}", targetPath, ex);
        }
    }

    private void validateImageFile(MultipartFile imageFile) {
        if (!ALLOWED_CONTENT_TYPES.contains(imageFile.getContentType())) {
            throw new BadRequestException("Only JPG, JPEG, PNG, and WEBP image files are allowed");
        }
    }

    private String extractExtension(String originalFilename) {
        String cleanedFileName = StringUtils.cleanPath(originalFilename == null ? "" : originalFilename);
        int extensionIndex = cleanedFileName.lastIndexOf('.');

        if (extensionIndex < 0) {
            throw new BadRequestException("Uploaded image must have a valid file extension");
        }

        return cleanedFileName.substring(extensionIndex);
    }
}
