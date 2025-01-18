package com.example.microservicesbackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class MicroServicesBackendApplicationTests {

    @Test
    void contextLoads() {
    }

}


/*
package com.example.microservicesbackend;

import com.bloxbean.cardano.client.address.Address;
import com.bloxbean.cardano.client.cip.cip30.DataSignature;
import com.bloxbean.cardano.client.cip.cip8.COSESign1;
import com.bloxbean.cardano.client.util.HexUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

public class MicroServicesBackendApplicationTests {

    // Helper to parse JSON to DataSignature
    private DataSignature parseDataSignature(String json) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        return DataSignature.from(json);
    }

    // Helper to extract and print address details
    private void printAddressDetails(DataSignature dataSignature) {
        try {
            String addressValue = Arrays.toString(dataSignature.address());

            // Log the extracted address
            System.out.println("Extracted Address: " + addressValue);

            // Validate the address
            if (addressValue.isEmpty()) {
                throw new IllegalArgumentException("Provided address is null or empty.");
            }

            // Initialize the Address object
            Address address = new Address(addressValue);
            String bech32Address = address.toBech32();
            System.out.println("Bech32 Address: " + bech32Address);

        } catch (IllegalArgumentException e) {
            System.err.println("Invalid Address: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error processing address: " + e.getMessage());
        }
    }

    // Helper to print COSESign1 details
    private void printCoseSign1Details(String signature) {
        try {
            COSESign1 coseSign1 = COSESign1.deserialize(HexUtil.decodeHexString(signature));
            System.out.println("COSESign1 Payload: " + new String(coseSign1.payload()));
            System.out.println("COSESign1 Protected Headers: " + coseSign1.headers());
        } catch (Exception e) {
            System.err.println("Error parsing COSESign1 signature: " + e.getMessage());
        }
    }

    @Test
    void testMe() throws Exception {
        String json = "{\n" +
                "    \"signature\": \"845846a201276761646472657373583901f96aa92d9c18c272fdd09516f506050bad5f475f4edaab0d877597d37c06c1591f4ad1475c5af28337d0f43f5553d10d7f528882c2650b13a166686173686564f4582677656233617574682e636f6f6c776562736974652e636f6d3b31363533303432353238393033584098c08678936713e5a0ba9487d21b95234801fb82414716ad942393c152f4923f44769a7947dadaf60573d3b54ddd9f81ce3439a98e5cc4f6cc2e6bb625b12300\",\n" +
                "    \"key\": \"a4010103272006215820a8ec37d0fdab09227dd2a3d1fba119d61f2bb1e1c98abd9a04cf9e0c3c0b4fa7\"\n" +
                "}";

        // Parse DataSignature
        DataSignature dataSignature = parseDataSignature(json);

        // Print address details
        printAddressDetails(dataSignature);

        // Print COSESign1 details
        printCoseSign1Details(dataSignature.signature());

    }
}
*/
