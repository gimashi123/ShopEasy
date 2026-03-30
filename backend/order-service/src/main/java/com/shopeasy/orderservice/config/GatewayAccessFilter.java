package com.shopeasy.orderservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class GatewayAccessFilter extends OncePerRequestFilter {

    @Value("${security.gateway.enabled:true}")
    private boolean gatewayHeaderValidationEnabled;

    @Value("${security.gateway.header-name:X-Gateway-Key}")
    private String gatewayHeaderName;

    @Value("${security.gateway.header-value:change-me-order-key}")
    private String gatewayHeaderValue;

    @Value("${security.gateway.allow-swagger-direct-access:true}")
    private boolean allowSwaggerDirectAccess;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path == null || !path.startsWith("/api/orders");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!gatewayHeaderValidationEnabled || isSwaggerUiRequest(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String incomingHeaderValue = request.getHeader(gatewayHeaderName);
        if (!gatewayHeaderValue.equals(incomingHeaderValue)) {
            response.sendError(
                    HttpStatus.FORBIDDEN.value(),
                    "Direct access denied. Use API Gateway on port 8080.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isSwaggerUiRequest(HttpServletRequest request) {
        if (!allowSwaggerDirectAccess) {
            return false;
        }

        String referer = request.getHeader("Referer");
        if (referer == null) {
            return false;
        }

        return referer.contains("/swagger-ui") || referer.contains("/swagger-ui.html");
    }
}
