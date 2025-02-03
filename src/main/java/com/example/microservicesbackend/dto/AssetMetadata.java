package com.example.microservicesbackend.dto;

import lombok.Data;

@Data
public class AssetMetadata {
    private String name;
    private String description;
    private String image;
    private String prefix;
    private String firstName;
    private String lastName;
    private String suffix;
}
