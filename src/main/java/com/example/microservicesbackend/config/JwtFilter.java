package com.example.microservicesbackend.config;

import com.example.microservicesbackend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

public class JwtFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);
    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String jwt = extractJwtFromRequest(request);

        if (StringUtils.hasText(jwt) && jwtService.validateToken(jwt)) {
            String baseAddress = jwtService.extractClaim(jwt, "baseAddress");

            // You can enhance this to include ADA handle and other claims as needed
            User user = new User(baseAddress, "", new ArrayList<>());

            // Set SecurityContext
            SecurityContextHolder.getContext().setAuthentication(
                    new JwtAuthenticationToken(user, null, user.getAuthorities())
            );

            logger.info("Authentication set for user: {}", baseAddress);
        }

        chain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
