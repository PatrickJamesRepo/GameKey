package com.example.microservicesbackend.service;

import com.bloxbean.cardano.client.api.exception.ApiException;
import com.bloxbean.cardano.client.backend.api.AddressService;
import com.bloxbean.cardano.client.backend.model.AddressContent;
import com.bloxbean.cardano.client.backend.model.TxContentOutputAmount;
import com.example.microservicesbackend.dto.AssetMetadataRequest;
import com.example.microservicesbackend.dto.AssetMetadataResponse;
import com.example.microservicesbackend.dto.CustomAddressContent;
import com.example.microservicesbackend.dto.AssetDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final Logger logger = LoggerFactory.getLogger(WalletService.class);
    private final BlockfrostService blockfrostService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String BLOCKFROST_API_URL = "https://cardano-mainnet.blockfrost.io/api/v0/assets/";

    @Value("${blockfrost.key}")
    private String blockfrostApiKey;

    /**
     * ----------------------------
     * BATCH FETCH LOGIC
     * ----------------------------
     * Fetches metadata for multiple assets in batch.
     */
    public List<AssetMetadataResponse> getBatchAssetMetadata(List<AssetMetadataRequest> assets) {
        ExecutorService executorService = Executors.newFixedThreadPool(10);

        List<CompletableFuture<AssetMetadataResponse>> futures = assets.stream()
                .map(asset ->
                        CompletableFuture.supplyAsync(() -> fetchAssetMetadata(asset), executorService)
                )
                .toList();

        List<AssetMetadataResponse> results = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());

        executorService.shutdown();
        return results;
    }

    /**
     * For batch usage only. Delegates to getSingleAssetMetadata().
     */
    private AssetMetadataResponse fetchAssetMetadata(AssetMetadataRequest assetRequest) {
        return getSingleAssetMetadata(assetRequest.getPolicyID(), assetRequest.getAssetNameHex());
    }

    /**
     * ----------------------------
     * SINGLE ASSET LOGIC
     * ----------------------------
     * Fetch metadata for a single asset.
     */
    public AssetMetadataResponse getSingleAssetMetadata(String policyId, String assetNameHex) {
        String assetId = policyId + assetNameHex;
        String url = BLOCKFROST_API_URL + assetId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("project_id", blockfrostApiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode metadataNode = rootNode.path("onchain_metadata");

                if (metadataNode.isMissingNode()) {
                    logger.warn("No metadata found for asset {}", assetId);
                    return new AssetMetadataResponse(assetId, null, policyId, assetNameHex);
                }

                Map metadata = objectMapper.convertValue(metadataNode, Map.class);

                // Convert IPFS image links
                if (metadata.containsKey("image")) {
                    String ipfsUrl = metadata.get("image").toString();
                    if (ipfsUrl.startsWith("ipfs://")) {
                        metadata.put("image", ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/"));
                    }
                }

                return new AssetMetadataResponse(assetId, metadata, policyId, assetNameHex);
            }
        } catch (Exception e) {
            logger.error("Error fetching metadata for asset {}: {}", assetId, e.getMessage());
        }

        return new AssetMetadataResponse(assetId, null, policyId, assetNameHex);
    }

    /**
     * ----------------------------
     * WALLET CONTENT LOGIC
     * ----------------------------
     * Fetches wallet content (balance, assets, and collections).
     */
    // WalletService.java
    public CustomAddressContent getAddressContent(String baseAddress) throws ApiException {
        AddressService addressService = blockfrostService.getAddressService();
        AddressContent content = addressService.getAddressInfo(baseAddress).getValue();

        List<AssetDTO> assetDTOList = new ArrayList<>();

        if (content.getAmount() != null) {
            content.getAmount().forEach(asset -> {
                AssetDTO dto = new AssetDTO();
                dto.setUnit(asset.getUnit());
                dto.setQuantity(asset.getQuantity());

                // Skip processing Lovelace (ADA)
                if ("lovelace".equalsIgnoreCase(asset.getUnit())) {
                    logger.info("Skipping metadata processing for Lovelace.");
                    assetDTOList.add(dto);
                    return;
                }

                try {
                    if (asset.getUnit().length() >= 56) {
                        String policyId = asset.getUnit().substring(0, 56);
                        String assetNameHex = asset.getUnit().substring(56);
                        AssetMetadataResponse metaResponse = getSingleAssetMetadata(policyId, assetNameHex);

                        if (metaResponse.getMetadata() != null) {
                            dto.setName((String) metaResponse.getMetadata().get("name"));
                            dto.setDescription((String) metaResponse.getMetadata().get("description"));
                            dto.setIpfsUrl((String) metaResponse.getMetadata().get("image"));

                            // Remove these fields from extra metadata
                            Map<String, Object> metaMap = new HashMap<>(metaResponse.getMetadata());
                            metaMap.remove("name");
                            metaMap.remove("description");
                            metaMap.remove("image");
                            dto.setExtraMetadata(metaMap);
                        }
                    } else {
                        logger.warn("Invalid asset unit length for {}", asset.getUnit());
                    }
                } catch (Exception e) {
                    logger.error("Error processing metadata for asset {}", asset.getUnit(), e);
                }
                assetDTOList.add(dto);
            });
        }

        // Compute Lovelace balance
        String balance = content.getAmount().stream()
                .filter(asset -> "lovelace".equals(asset.getUnit()))
                .map(TxContentOutputAmount::getQuantity)
                .findFirst()
                .orElse("0");

        // Group NFT assets by policy ID
        List<AssetDTO> nftAssets = assetDTOList.stream()
                .filter(asset -> !"lovelace".equalsIgnoreCase(asset.getUnit()))
                .filter(asset -> asset.getName() != null && asset.getIpfsUrl() != null)
                .toList();

        Map<String, List<AssetDTO>> nftCollections = nftAssets.stream()
                .filter(asset -> asset.getUnit().length() > 56)
                .collect(Collectors.groupingBy(asset -> asset.getUnit().substring(0, 56)));

        // Optionally, flatten the NFT collections and merge them with assetDTOList.
        List<AssetDTO> flattenedNfts = nftCollections.values().stream()
                .flatMap(Collection::stream)
                .toList();

        // Merge both lists and dedupe by asset unit.
        Map<String, AssetDTO> combined = new HashMap<>();
        assetDTOList.forEach(dto -> combined.put(dto.getUnit(), dto));
        flattenedNfts.forEach(dto -> combined.put(dto.getUnit(), dto));

        CustomAddressContent customContent = new CustomAddressContent();
        customContent.setBalance(balance);
        customContent.setAssets(new ArrayList<>(combined.values()));
        customContent.setNftCollections(nftCollections);

        logger.info("CustomAddressContent for baseAddress {}: \n{}", baseAddress, customContent);
        return customContent;
    }
}
