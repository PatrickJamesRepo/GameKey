package com.example.microservicesbackend.controller;

import com.bloxbean.cardano.client.api.exception.ApiException;
import com.example.microservicesbackend.dto.CustomAddressContent;
import com.example.microservicesbackend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/{baseAddress}")
    public CustomAddressContent getWalletContent(@PathVariable String baseAddress) throws ApiException {
        return walletService.getAddressContent(baseAddress);
    }
}
