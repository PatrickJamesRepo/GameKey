package com.example.microservicesbackend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CustomAddressContent {
    private String balance;
    private List<AssetDTO> assets;
    private Map<String, List<AssetDTO>> nftCollections;
}
