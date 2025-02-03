package com.example.microservicesbackend.controller;

import com.example.microservicesbackend.model.Login;
import com.example.microservicesbackend.model.Login.*;
import com.example.microservicesbackend.service.BlockfrostService;
import com.example.microservicesbackend.service.JwtService;
import com.bloxbean.cardano.client.address.Address;
import com.bloxbean.cardano.client.api.exception.ApiException;
import com.bloxbean.cardano.client.api.model.Result;
import com.bloxbean.cardano.client.backend.api.AddressService;
import com.bloxbean.cardano.client.backend.model.AddressContent;
import com.bloxbean.cardano.client.backend.model.TxContentOutputAmount;
import com.bloxbean.cardano.client.cip.cip30.CIP30DataSigner;
import com.bloxbean.cardano.client.cip.cip30.DataSignature;
import com.bloxbean.cardano.client.util.HexUtil;
import com.bloxbean.cardano.client.util.Tuple;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class LoginController {

    private static final String ADAHANDLE_POLICY_ID = "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a";

    // Define the default PCS collection policy IDs as a list
    private static final List<String> PCS_COLLECTION_POLICY_IDS = Arrays.asList(
            "f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e",
            "d91b5642303693f5e7a188748bfd1a26c925a1c5e382e19a13dd263c",
            "52f53a3eb07121fcbec36dae79f76abedc6f3a877f8c8857e6c204d1"
    );

    private final static Integer POLICY_ID_LENGTH = 56;
    private final static String WEBSITE = "web3auth.puurrty.io";
    private final static Map<String, String> MESSAGES = new HashMap<>();

    Logger logger = LoggerFactory.getLogger(LoginController.class);

    private final BlockfrostService blockfrostService;
    private final JwtService jwtService;

    public LoginController(BlockfrostService blockfrostService, JwtService jwtService) {
        this.blockfrostService = blockfrostService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Login login) throws JsonProcessingException {
        System.out.println("Received Login Object: " + login);
        System.out.println("Data Signature: " + login.getDataSignature());

        DataSignature tmpSignature = DataSignature.from(login.getDataSignature());
        DataSignature dataSignature = new DataSignature(tmpSignature.signature(), tmpSignature.key());

        Address address = new Address(dataSignature.address());
        String bech32Address = address.toBech32();
        System.out.println("Bech32 Address: " + bech32Address);

        // Retrieve the nonce that was generated earlier for this base address
        Optional<String> nonceOpt = Optional.ofNullable(MESSAGES.get(bech32Address));
        if (!nonceOpt.isPresent()) {
            System.out.println("No nonce found for this address.");
            return ResponseEntity.badRequest().build();
        }
        String nonce = nonceOpt.get();
        System.out.println("Nonce: " + nonce);

        // Extract ada_handle option if present
        Optional<String> adaHandleOpt = Arrays.stream(nonce.split(";"))
                .filter(stuff -> stuff.trim().startsWith("ada_handle"))
                .findFirst()
                .map(handle -> handle.split(":", 2)[1]);
        System.out.println("Ada Handle: " + adaHandleOpt.orElse("none"));

        // Extract PCS policy IDs option if present
        Optional<String> pcsOpt = Arrays.stream(nonce.split(";"))
                .filter(stuff -> stuff.trim().startsWith("pcs:"))
                .findFirst()
                .map(pcsStr -> pcsStr.split(":", 2)[1]);
        System.out.println("PCS Policy IDs: " + pcsOpt.orElse("none"));

        // Verify signature
        boolean verified = CIP30DataSigner.INSTANCE.verify(dataSignature);
        logger.info(String.format("Verified? %s", verified));

        // Create token; you might consider modifying jwtService.createToken to accept both options
        Optional<String> token = jwtService.createToken(bech32Address, adaHandleOpt);
        return token.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @GetMapping("/nonce")
    public String getNonce(@RequestParam("base_address") String baseAddress,
                           @RequestParam(value = "ada_handle", required = false) Optional<String> adaHandle,
                           @RequestParam(value = "pcs", required = false) Optional<String> pcs) throws ApiException {
        logger.info("base_address: " + baseAddress);
        String timestamp = String.valueOf(System.currentTimeMillis());
        // Start the nonce with website and timestamp
        String nonce = String.format("%s;%s", WEBSITE, timestamp);
        if (adaHandle.isPresent()) {
            nonce = String.format("%s;ada_handle:%s", nonce, adaHandle.get());
        }
        // If the client supplies a "pcs" parameter, use that; otherwise, use the default PCS policy IDs list.
        String pcsStr = pcs.filter(s -> !s.isEmpty())
                .orElse(String.join(",", PCS_COLLECTION_POLICY_IDS));
        nonce = String.format("%s;pcs:%s", nonce, pcsStr);

        MESSAGES.put(baseAddress, nonce);
        return nonce;
    }

    @GetMapping("/utxos/{baseAddress}")
    public void getUtxos(@PathVariable String baseAddress) throws ApiException {
        AddressService addressService = blockfrostService.getAddressService();
        Result<AddressContent> addressInfo = addressService.getAddressInfo(baseAddress);
        addressInfo
                .getValue()
                .getAmount()
                .stream()
                .map(TxContentOutputAmount::getUnit)
                .filter(assetId -> assetId.startsWith(ADAHANDLE_POLICY_ID))
                .map(assetId -> {
                    String policyId = assetId.substring(0, POLICY_ID_LENGTH);
                    String assetNameHex = assetId.substring(POLICY_ID_LENGTH);
                    String assetName = new String(HexUtil.decodeHexString(assetNameHex));
                    return new Tuple(policyId, assetName);
                })
                .forEach(tuple -> System.out.printf("%s %s%n", tuple._1, tuple._2));
    }

    @GetMapping("/adahandles")
    public List<String> getAdahandles(@RequestParam("base_address") String baseAddress) throws ApiException {
        AddressService addressService = blockfrostService.getAddressService();
        Result<AddressContent> addressInfo = addressService.getAddressInfo(baseAddress);
        return addressInfo
                .getValue()
                .getAmount()
                .stream()
                .map(TxContentOutputAmount::getUnit)
                .filter(assetId -> assetId.startsWith(ADAHANDLE_POLICY_ID))
                .map(assetId -> {
                    String assetNameHex = assetId.substring(POLICY_ID_LENGTH);
                    String assetName = new String(HexUtil.decodeHexString(assetNameHex));
                    System.out.println(assetName);
                    return assetName;
                })
                .collect(Collectors.toList());
    }
}
