package com.example.microservicesbackend.controller;

import java.util.HashMap;
import java.util.Map;

public class LoginControllerHelper {
    // A simple static map to store nonces keyed by the base address.
    // You may want to refactor this into a proper service with expiration logic.
    private static final Map<String, String> NONCE_MAP = new HashMap<>();

    /**
     * Sets the nonce for the given base address.
     *
     * @param baseAddress the base address (e.g., Bech32 address)
     * @param nonce the nonce value to store
     */
    public static void setNonce(String baseAddress, String nonce) {
        NONCE_MAP.put(baseAddress, nonce);
    }

    /**
     * Retrieves the nonce for the given base address.
     *
     * @param baseAddress the base address (e.g., Bech32 address)
     * @return the nonce if it exists, or null otherwise
     */
    public static String getNonce(String baseAddress) {
        return NONCE_MAP.get(baseAddress);
    }
}
