package com.example.microservicesbackend.service;

import com.bloxbean.cardano.client.backend.api.AddressService;
import com.bloxbean.cardano.client.backend.api.BackendService;
import com.bloxbean.cardano.client.backend.blockfrost.common.Constants;
import com.bloxbean.cardano.client.backend.blockfrost.service.BFBackendService;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Getter
@Service
public class BlockfrostService {

    private final AddressService addressService;
    private static final Logger logger = LoggerFactory.getLogger(BlockfrostService.class);

    @Value("${blockfrost.key}")
    private String blockfrostKey;

    // Constructor for BlockfrostService
    public BlockfrostService(@Value("${blockfrost.key}") String blockfrostKey) {
        logger.info("Initializing BlockfrostService with blockfrostKey: " + blockfrostKey);

        // Initialize the BackendService using Blockfrost key and URL
        BackendService backendService = new BFBackendService(Constants.BLOCKFROST_MAINNET_URL, blockfrostKey);
        this.addressService = backendService.getAddressService();

        if (this.addressService != null) {
            logger.info("AddressService initialized successfully.");
        } else {
            logger.error("Failed to initialize AddressService.");
        }
    }
}
