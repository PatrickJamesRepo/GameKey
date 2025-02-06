package com.example.microservicesbackend.service;

import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class DidService {

    /**
     * Generates a Decentralized Digital Identity for a given Cardano base address.
     * In this example, a SHA-256 hash of the address is computed and then encoded in URL-safe Base64 format.
     *
     * @param baseAddress The user's Cardano base address (in Bech32).
     * @return A Decentralized Digital Identity string, e.g., "did:cardano:<hash>"
     */
    public String generateDid(String baseAddress) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(baseAddress.getBytes());
            // Use URL-safe Base64 encoding without padding
            String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
            String did = "did:cardano:" + encoded;
            System.out.println("Generated Decentralized Digital Identity: " + did);
            return did;
        } catch (Exception e) {
            throw new RuntimeException("Error generating Decentralized Digital Identity", e);
        }
    }
}
