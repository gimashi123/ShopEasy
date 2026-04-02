package com.shopeasy.authservice.config;

import com.shopeasy.authservice.model.User;
import com.shopeasy.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.email:admin@mail.com}")
    private String adminEmail;

    @Value("${admin.password:admin@1234}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        log.info("Checking for default admin user: {}", adminUsername);
        Optional<User> existingAdmin = userRepository.findByUsername(adminUsername);
        
        if (existingAdmin.isEmpty()) {
            log.info("No default admin found. Creating admin user: {}", adminUsername);
            User admin = User.builder()
                    .username(adminUsername)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .roles("ROLE_USER,ROLE_ADMIN")
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created successfully.");
        } else {
            User admin = existingAdmin.get();
            boolean updated = false;

            // Sync password if it doesn't match
            if (!passwordEncoder.matches(adminPassword, admin.getPassword())) {
                log.info("Admin password out of sync. Updating password for: {}", adminUsername);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                updated = true;
            }

            // Sync roles if ROLE_ADMIN is missing
            if (!admin.getRoles().contains("ROLE_ADMIN")) {
                log.info("Admin roles out of sync. Adding ROLE_ADMIN to: {}", adminUsername);
                admin.setRoles("ROLE_USER,ROLE_ADMIN");
                updated = true;
            }

            if (updated) {
                userRepository.save(admin);
                log.info("Admin user credentials updated successfully.");
            } else {
                log.info("Admin user already exists and is in sync. Skipping.");
            }
        }
    }
}
