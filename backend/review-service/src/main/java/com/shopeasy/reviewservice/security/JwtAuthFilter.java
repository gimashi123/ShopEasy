

package com.shopeasy.reviewservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 🔥 ADD HERE
        System.out.println("JWT FILTER HIT");

        String authHeader = request.getHeader("Authorization");

        // 🔥 ADD HERE
        System.out.println("Auth Header: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No valid token found");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        System.out.println("Token: " + token);

        if (!jwtUtil.validateToken(token)) {
            System.out.println("Invalid token");
            filterChain.doFilter(request, response);
            return;
        }

        String username = jwtUtil.extractUsername(token);
        System.out.println("Username: " + username);

        var roles = jwtUtil.extractRoles(token);
        System.out.println("Roles: " + roles);

        var authorities = roles.stream()
                .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                .toList();

        var auth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                username,
                null,
                authorities
        );

        // 🔥 IMPORTANT
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}