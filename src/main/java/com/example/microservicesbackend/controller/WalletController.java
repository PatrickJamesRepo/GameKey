package com.example.microservicesbackend.controller;

import com.bloxbean.cardano.client.api.exception.ApiException;
import com.example.microservicesbackend.dto.AssetMetadataRequest;
import com.example.microservicesbackend.dto.AssetMetadataResponse;
import com.example.microservicesbackend.dto.CustomAddressContent;
import com.example.microservicesbackend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private static final Logger logger = LoggerFactory.getLogger(WalletController.class);
    private final WalletService walletService;

    /**
     * Fetch wallet content, including balance and assets.
     */
    @GetMapping("/{baseAddress}")
    public CustomAddressContent getWalletContent(@PathVariable String baseAddress) throws ApiException {
        logger.info("Fetching wallet content for address: {}", baseAddress);
        return walletService.getAddressContent(baseAddress);
    }

    /**
     * Batch fetch metadata for multiple assets.
     */
    @PostMapping("/assetsBatch")
    public List<AssetMetadataResponse> fetchAssetsBatch(@RequestBody List<AssetMetadataRequest> assets) {
        logger.info("Fetching metadata for {} assets...", assets.size());
        return walletService.getBatchAssetMetadata(assets);
    }


    /**
     * Fetch metadata for a single asset.
     */
    @GetMapping("/asset")
    public AssetMetadataResponse fetchSingleAsset(
            @RequestParam String policy_id,
            @RequestParam String asset_name) {
        logger.info("Fetching metadata for asset: {}{}", policy_id, asset_name);
        return walletService.getSingleAssetMetadata(policy_id, asset_name);
    }


}
