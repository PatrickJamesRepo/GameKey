package com.example.microservicesbackend.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class JwtService {

    private static final Algorithm ALGORITHM = Algorithm.HMAC256("mysupersecret");

    private static final JWTVerifier verifier = JWT.require(ALGORITHM).withIssuer("auth0").build();

    /**
     * Creates a JWT token with baseAddress and optional ADA handle.
     *
     * @param baseAddress The base address of the user.
     * @param adaHandle   An Optional containing the ADA handle.
     * @return An Optional containing the generated JWT token if successful.
     */
    public Optional<String> createToken(String baseAddress, Optional<String> adaHandle) {
        try {
            JWTCreator.Builder builder = JWT.create()
                    .withIssuer("auth0")
                    .withClaim("base_address", baseAddress);

            adaHandle.ifPresent(handle -> builder.withClaim("ada_handle", handle));

            return Optional.of(builder.sign(ALGORITHM));
        } catch (JWTCreationException exception) {
            return Optional.empty();
        }
    }

    /**
     * Validates a JWT token.
     *
     * @param token The JWT token to validate.
     * @return An Optional containing the DecodedJWT if validation succeeds.
     */
    public Optional<DecodedJWT> validate(String token) {
        try {
            return Optional.of(verifier.verify(token));
        } catch (JWTVerificationException exception) {
            return Optional.empty();
        }
    }

    /**
     * Extracts the username (baseAddress) from the JWT token.
     *
     * @param jwt The JWT token.
     * @return The base address if it exists in the token.
     */
    public String extractUsername(String jwt) {
        return validate(jwt)
                .map(decodedJWT -> decodedJWT.getClaim("base_address").asString())
                .orElse(null);
    }

    /**
     * Checks if the provided JWT token is valid.
     *
     * @param jwt The JWT token to validate.
     * @return True if the token is valid, otherwise false.
     */
    public boolean validateToken(String jwt) {
        return validate(jwt).isPresent();
    }

    /**
     * Extracts a specific claim from the JWT token.
     *
     * @param jwt   The JWT token.
     * @param claim The name of the claim to extract.
     * @return The claim value as a String, or null if it does not exist.
     */
    public String extractClaim(String jwt, String claim) {
        return validate(jwt)
                .map(decodedJWT -> decodedJWT.getClaim(claim).asString())
                .orElse(null);
    }
}
