package com.example.microservicesbackend.dto;

import lombok.Data;

import java.util.Map;

@Data
public class AssetDTO {
    private String unit;
    private String quantity;
    private String name;
    private String description;
    private String ipfsUrl;
    private String prefix;
    private String firstName;
    private String lastName;
    private String suffix;
    private Map<String, Object> extraMetadata;
}
