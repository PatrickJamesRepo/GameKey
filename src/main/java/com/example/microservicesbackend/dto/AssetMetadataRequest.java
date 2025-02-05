package com.example.microservicesbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssetMetadataRequest {
    private String policyID;
    private String assetNameHex;
}
