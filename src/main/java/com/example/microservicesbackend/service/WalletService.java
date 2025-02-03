package com.example.microservicesbackend.service;

import com.bloxbean.cardano.client.api.exception.ApiException;
import com.bloxbean.cardano.client.backend.api.AddressService;
import com.bloxbean.cardano.client.backend.model.AddressContent;
import com.bloxbean.cardano.client.backend.model.TxContentOutputAmount;
import com.example.microservicesbackend.dto.AssetDTO;
import com.example.microservicesbackend.dto.AssetMetadata;
import com.example.microservicesbackend.dto.CustomAddressContent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final Logger logger = LoggerFactory.getLogger(WalletService.class);
    private final BlockfrostService blockfrostService;
    private final ObjectMapper mapper = new ObjectMapper();

    public CustomAddressContent getAddressContent(String baseAddress) throws ApiException {
        AddressService addressService = blockfrostService.getAddressService();
        AddressContent content = addressService.getAddressInfo(baseAddress).getValue();

        List<AssetDTO> assetDTOList = new ArrayList<>();

        if (content.getAmount() != null) {
            content.getAmount().forEach(asset -> {
                AssetDTO dto = new AssetDTO();
                dto.setUnit(asset.getUnit());
                dto.setQuantity(asset.getQuantity());

                try {
                    AssetMetadata meta = blockfrostService.getAssetMetadata(asset.getUnit());
                    if (meta != null) {
                        dto.setName(meta.getName());
                        dto.setDescription(meta.getDescription());
                        dto.setPrefix(meta.getPrefix());
                        dto.setFirstName(meta.getFirstName());
                        dto.setLastName(meta.getLastName());
                        dto.setSuffix(meta.getSuffix());

                        // Process the IPFS image field
                        String ipfsField = meta.getImage();
                        if (ipfsField != null && !ipfsField.isEmpty()) {
                            if (ipfsField.startsWith("ipfs://")) {
                                ipfsField = ipfsField.substring(7);
                            }
                            String ipfsUrl = "https://ipfs.io/ipfs/" + ipfsField;
                            dto.setIpfsUrl(ipfsUrl);
                        }

                        // Convert the metadata to a map for extra metadata
                        Map<String, Object> metaMap = mapper.convertValue(meta, new TypeReference<Map<String, Object>>() {});
                        metaMap.remove("name");
                        metaMap.remove("description");
                        metaMap.remove("image");
                        metaMap.remove("prefix");
                        metaMap.remove("firstName");
                        metaMap.remove("lastName");
                        metaMap.remove("suffix");
                        dto.setExtraMetadata(metaMap);
                    }
                } catch (Exception e) {
                    logger.error("Error processing metadata for asset {}", asset.getUnit(), e);
                }

                assetDTOList.add(dto);
            });
        }

        // Compute the Lovelace balance
        String balance = content.getAmount().stream()
                .filter(asset -> "lovelace".equals(asset.getUnit()))
                .map(TxContentOutputAmount::getQuantity)
                .findFirst()
                .orElse("0");

        // Filter NFT assets and group them by policy ID
        List<AssetDTO> nftAssets = assetDTOList.stream()
                .filter(asset -> !"lovelace".equalsIgnoreCase(asset.getUnit()))
                .filter(asset -> asset.getName() != null && asset.getIpfsUrl() != null)
                .toList();

        Map<String, List<AssetDTO>> nftCollections = nftAssets.stream()
                .filter(asset -> asset.getUnit().length() > 56)
                .collect(Collectors.groupingBy(asset -> asset.getUnit().substring(0, 56)));

        CustomAddressContent customContent = new CustomAddressContent();
        customContent.setBalance(balance);
        customContent.setAssets(assetDTOList);
        customContent.setNftCollections(nftCollections);

        logger.info("CustomAddressContent for baseAddress {}: \n{}", baseAddress, customContent);
        return customContent;
    }
}
