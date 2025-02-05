package com.example.microservicesbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssetMetadataResponse {
    private String assetID;
    private Map<String, Object> metadata;
    private String policyID;
    private String assetNameHex;
}
