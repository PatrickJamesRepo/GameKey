package com.example.microservicesbackend.config;

import com.example.microservicesbackend.service.DidService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

public class DidFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(DidFilter.class);

    public DidFilter(DidService didService) {
        // Optionally log that the filter is initialized.
        logger.info("Decentralized Digital Identity Filter initialized.");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String didToken = extractDidTokenFromRequest(request);

        if (StringUtils.hasText(didToken)) {
            if (didToken.startsWith("did:cardano:")) {
                // Log the token extraction and authentication setting.
                logger.info("Extracted Decentralized Digital Identity: {}", didToken);
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        didToken, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Decentralized Digital Identity authentication set for token: {}", didToken);
            }
        }
        chain.doFilter(request, response);
    }

    private String extractDidTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("DID ")) {
            return authHeader.substring(4);
        }
        return null;
    }
}
