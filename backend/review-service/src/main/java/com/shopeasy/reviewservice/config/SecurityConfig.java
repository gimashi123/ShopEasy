//package com.shopeasy.reviewservice.config;
//
//import com.shopeasy.reviewservice.security.JwtAuthFilter;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
//@Configuration
//@RequiredArgsConstructor
//public class SecurityConfig {
//
//    private final JwtAuthFilter jwtAuthFilter;
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//
//        http
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth -> auth
//
//                        // Swagger
//                        .requestMatchers(
//                                "/api/auth/**",
//                                "/actuator/**",
//                                "/v3/api-docs/**",
//                                "/swagger-ui/**",
//                                "/swagger-ui.html"
//                        ).permitAll()
//
//                        // 🔥 Protect APIs
//                        .anyRequest().authenticated()
//                )
//                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//}
//package com.shopeasy.reviewservice.config;
//
//import com.shopeasy.reviewservice.security.JwtAuthFilter;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
//@Configuration
//@RequiredArgsConstructor
//public class SecurityConfig {
//
//    private final JwtAuthFilter jwtAuthFilter;
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//
//        http
//                .csrf(csrf -> csrf.disable())
//
//                // 🔥 ADD THIS (VERY IMPORTANT)
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//
//                .authorizeHttpRequests(auth -> auth
//
//                        // Public endpoints
//                        .requestMatchers(
//                                "/api/auth/**",
//                                "/actuator/**",
//                                "/v3/api-docs/**",
//                                "/swagger-ui/**",
//                                "/swagger-ui.html"
//                        ).permitAll()
//
//                        // All other endpoints require authentication
//                        .anyRequest().authenticated()
//                )
//
//                // JWT filter
//                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//}
//package com.shopeasy.reviewservice.config;
//
//import com.shopeasy.reviewservice.security.JwtAuthFilter;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
///**
// * Protects review APIs using JWT roles from auth-service.
// */
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity
//@RequiredArgsConstructor
//public class SecurityConfig {
//
//    private final JwtAuthFilter jwtAuthFilter;
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//
//        http
//                .csrf(AbstractHttpConfigurer::disable)
//
//                // ✅ Stateless (JWT)
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//
//                .authorizeHttpRequests(auth -> auth
//
//                        // ✅ Public endpoints
//                        .requestMatchers(
//                                "/api/auth/**",
//                                "/actuator/**",
//
//                                // Swagger
//                                "/v3/api-docs/**",
//                                "/swagger-ui/**",
//                                "/swagger-ui.html"
//                        ).permitAll()
//
//                        // ✅ Review APIs
//
//                        // Anyone logged in can VIEW reviews
//                        .requestMatchers(HttpMethod.GET, "/api/reviews/**")
//                        .hasAnyRole("USER", "ADMIN")
//
//                        .requestMatchers(HttpMethod.POST, "/api/reviews/**")
//                        .hasAnyRole("USER", "ADMIN")
//
//                        .requestMatchers(HttpMethod.PUT, "/api/reviews/**")
//                        .hasAnyRole("USER", "ADMIN")
//
//                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/**")
//                        .hasAnyRole("USER", "ADMIN")
//                        // Everything else requires login
//                        .anyRequest().authenticated()
//                )
//
//                // ✅ JWT filter
//                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//}
//package com.shopeasy.reviewservice.config;
//
//import com.shopeasy.reviewservice.security.JwtAuthFilter;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
///**
// * Protects review APIs using JWT roles from auth-service.
// */
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity
//@RequiredArgsConstructor
//public class SecurityConfig {
//
//    private final JwtAuthFilter jwtAuthFilter;
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//
//        http
//                .csrf(AbstractHttpConfigurer::disable)
//
//                // ✅ Stateless (JWT)
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//
//                .authorizeHttpRequests(auth -> auth
//
//                        // ✅ Public endpoints (Added /error here!)
//                        .requestMatchers(
//                                "/api/auth/**",
//                                "/actuator/**",
//                                "/v3/api-docs/**",
//                                "/swagger-ui/**",
//                                "/swagger-ui.html",
//                                "/error" // <--- CRITICAL: Prevents 401s from masking real errors
//                        ).permitAll()
//
//                        // ✅ Review APIs
//                        // Switched from hasAnyRole to hasAnyAuthority for exact string matching
//                        .requestMatchers(HttpMethod.GET, "/api/reviews", "/api/reviews/**")
//                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
//
//                        .requestMatchers(HttpMethod.POST, "/api/reviews", "/api/reviews/**")
//                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
//
//                        .requestMatchers(HttpMethod.PUT, "/api/reviews", "/api/reviews/**")
//                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
//
//                        .requestMatchers(HttpMethod.DELETE, "/api/reviews", "/api/reviews/**")
//                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
//
//                        // Everything else requires login
//                        .anyRequest().authenticated()
//                )
//
//                // ✅ JWT filter
//                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//}
package com.shopeasy.reviewservice.config;

import com.shopeasy.reviewservice.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Protects review APIs using JWT roles from auth-service.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // ✅ Added CORS Customizer here
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)

                // ✅ Stateless (JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // ✅ Public endpoints (Added /error here!)
                        .requestMatchers(
                                "/api/auth/**",
                                "/actuator/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/error" // <--- CRITICAL: Prevents 401s from masking real errors
                        ).permitAll()

                        // ✅ Review APIs
                        // Switched from hasAnyRole to hasAnyAuthority for exact string matching
                        .requestMatchers(HttpMethod.GET, "/api/reviews", "/api/reviews/**")
                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/reviews", "/api/reviews/**")
                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/reviews", "/api/reviews/**")
                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/reviews", "/api/reviews/**")
                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                        // Everything else requires login
                        .anyRequest().authenticated()
                )

                // ✅ JWT filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ Added CORS Configuration Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow all origins for development (e.g., localhost:3000, localhost:5173)
        // Note: For production, replace "*" with your actual frontend domain
        configuration.setAllowedOriginPatterns(List.of("*"));

        // Explicitly allow the preflight OPTIONS method and standard methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow the Authorization header (for JWT) and Content-Type (for JSON)
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        // Allow credentials to be passed along with the request
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all endpoints in the microservice
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}