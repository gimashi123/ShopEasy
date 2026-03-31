//package com.shopeasy.reviewservice.security;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.JwtException;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.io.Decoders;
//import io.jsonwebtoken.security.Keys;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//import javax.crypto.SecretKey;
//import java.util.List;
//import java.util.function.Function;
//
//@Slf4j
//@Component
//public class JwtUtil {
//
//    @Value("${jwt.secret}")
//    private String secret;
//
//    public boolean validateToken(String token) {
//        try {
//            parseClaims(token);
//            return true;
//        } catch (JwtException | IllegalArgumentException ex) {
//            log.warn("Invalid JWT token: {}", ex.getMessage());
//            return false;
//        }
//    }
//
//    public String extractUsername(String token) {
//        return extractClaim(token, Claims::getSubject);
//    }
//
//    @SuppressWarnings("unchecked")
//    public List<String> extractRoles(String token) {
//        return extractClaim(token, claims -> (List<String>) claims.get("roles"));
//    }
//
//    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
//        return claimsResolver.apply(parseClaims(token));
//    }
//
//    private Claims parseClaims(String token) {
//        return Jwts.parser()
//                .setSigningKey(getSigningKey())
//                .parseClaimsJws(token)
//                .getBody();
//    }
//
//    private SecretKey getSigningKey() {
//        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
//    }
//}
package com.shopeasy.reviewservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.List;
import java.util.function.Function;

@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return extractClaim(token, claims -> (List<String>) claims.get("roles"));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(parseClaims(token));
    }

    // ✅ UPDATED: Using parserBuilder() instead of the deprecated parser()
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}