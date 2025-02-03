package com.example.microservicesbackend.service;

import com.bloxbean.cardano.client.backend.api.AddressService;
import com.bloxbean.cardano.client.backend.api.BackendService;
import com.bloxbean.cardano.client.backend.blockfrost.common.Constants;
import com.bloxbean.cardano.client.backend.blockfrost.service.BFBackendService;
import com.example.microservicesbackend.dto.AssetMetadata;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

    /**
     * Fetches the asset metadata for the given asset unit from Blockfrost using RestTemplate.
     *
     * @param assetUnit The asset unit (e.g., policyId + assetName in hex)
     * @return AssetMetadata object or null if an error occurs.
     */
    public AssetMetadata getAssetMetadata(String assetUnit) {
        String url = Constants.BLOCKFROST_MAINNET_URL + "/assets/" + assetUnit;
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("project_id", blockfrostKey);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<AssetMetadata> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    AssetMetadata.class
            );
            return response.getBody();
        } catch (Exception e) {
            logger.error("Error fetching asset metadata for asset unit: " + assetUnit, e);
            return null;
        }
    }
}
