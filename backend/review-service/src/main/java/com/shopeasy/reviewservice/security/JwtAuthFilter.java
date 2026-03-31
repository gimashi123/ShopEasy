//package com.shopeasy.reviewservice.security;
//
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.User;
//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.Collections;
//
//@Component
//public class JwtAuthFilter extends OncePerRequestFilter {
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request,
//                                    HttpServletResponse response,
//                                    FilterChain filterChain)
//            throws ServletException, IOException {
//
//        String authHeader = request.getHeader("Authorization");
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        String token = authHeader.substring(7);
//
//        // 🔥 SIMPLIFIED (we just extract username manually)
//        String username = extractUsername(token);
//
//        if (username != null) {
//            UsernamePasswordAuthenticationToken auth =
//                    new UsernamePasswordAuthenticationToken(
//                            new User(username, "", Collections.emptyList()),
//                            null,
//                            Collections.emptyList()
//                    );
//
//            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//
//            SecurityContextHolder.getContext().setAuthentication(auth);
//        }
//
//        filterChain.doFilter(request, response);
//    }
//
//    // 🔥 SIMPLE decode (for demo)
//    private String extractUsername(String token) {
//        try {
//            String[] parts = token.split("\\.");
//            String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));
//
//            // find "sub"
//            int start = payload.indexOf("\"sub\":\"") + 7;
//            int end = payload.indexOf("\"", start);
//
//            return payload.substring(start, end);
//
//        } catch (Exception e) {
//            return null;
//        }
//    }
//}

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