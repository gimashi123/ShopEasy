package com.shopeasy.authservice.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Application user – also implements Spring Security's UserDetails
 * so it can be used directly by the authentication manager.
 */
@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    private String id;

    @NotBlank
    @Indexed(unique = true)
    private String username;

    @Email
    @NotBlank
    @Indexed(unique = true)
    private String email;

    @NotBlank
    private String password;

    /**
     * Comma-separated role names, e.g. "ROLE_USER,ROLE_ADMIN".
     */
    @Builder.Default
    private String roles = "ROLE_USER";

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private Instant createdAt = Instant.now();

    private Instant updatedAt;

    // ── UserDetails ───────────────────────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    public List<String> getRoleList() {
        return Arrays.stream(roles.split(",")).map(String::trim).collect(Collectors.toList());
    }

    @Override public boolean isAccountNonExpired()    { return active; }
    @Override public boolean isAccountNonLocked()     { return active; }
    @Override public boolean isCredentialsNonExpired(){ return active; }
    @Override public boolean isEnabled()              { return active; }
}
