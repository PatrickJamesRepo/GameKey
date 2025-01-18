package com.example.microservicesbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.example.microservicesbackend")
public class MicroServicesMain {

    public static void main(String[] args) {
        SpringApplication.run(MicroServicesMain.class, args);
    }

}
