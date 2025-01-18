package com.example.microservicesbackend.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.bloxbean.cardano.client.cip.cip30.CIP30DataSigner;
import com.bloxbean.cardano.client.cip.cip30.DataSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    private static final String ADA_HANDLE_PREFIX = "ada_handle:";

    /**
     * Extracts the ADA handle from the provided nonce if present.
     *
     * @param nonce The nonce string.
     * @return An Optional containing the ADA handle, or empty if not found.
     */
    private Optional<String> extractAdaHandleFromNonce(String nonce) {
        try {
            return Optional.ofNullable(nonce)
                    .map(n -> n.split(";"))
                    .stream()
                    .flatMap(parts -> java.util.Arrays.stream(parts))
                    .filter(part -> part.startsWith(ADA_HANDLE_PREFIX))
                    .map(part -> part.substring(ADA_HANDLE_PREFIX.length()))
                    .findFirst();
        } catch (Exception e) {
            logger.error("Error extracting ADA handle from nonce: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Verifies the data signature using CIP-30 and validates the nonce payload.
     *
     * @param loginSignature The data signature from the wallet.
     * @param nonce          The expected nonce tied to the wallet address.
     * @return True if the signature and nonce are valid; false otherwise.
     */
    public boolean verifySignature(DataSignature loginSignature, String nonce) {
        try {
            boolean isValidSignature = CIP30DataSigner.INSTANCE.verify(loginSignature);

            if (!isValidSignature) {
                logger.error("Signature verification failed.");
                return false;
            }

            String payload = new String(loginSignature.coseSign1().payload());
            if (!nonce.equals(payload)) {
                logger.error("Nonce does not match payload. Expected: {}, Actual: {}", nonce, payload);
                return false;
            }

            return true;
        } catch (Exception e) {
            logger.error("Error verifying signature: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Creates a JWT for the authenticated user.
     *
     * @param baseAddress The base address of the user.
     * @param adaHandle   An Optional containing the ADA handle.
     * @return An Optional containing the JWT string if successful, or empty if an error occurs.
     */
    public Optional<String> createToken(String baseAddress, Optional<String> adaHandle) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret);

            // Build the JWT
            com.auth0.jwt.JWTCreator.Builder jwtBuilder = JWT.create()
                    .withSubject("CardanoUser")
                    .withIssuedAt(new Date())
                    .withExpiresAt(new Date(System.currentTimeMillis() + jwtExpirationMs))
                    .withClaim("baseAddress", baseAddress);

            // Add ADA handle claim if present
            adaHandle.ifPresent(handle -> jwtBuilder.withClaim("adaHandle", handle));

            // Sign and return the token
            String token = jwtBuilder.sign(algorithm);
            logger.info("Generated JWT for address: {}", baseAddress);

            return Optional.of(token);

        } catch (Exception e) {
            logger.error("Error generating JWT: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }


}
