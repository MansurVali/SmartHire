package com.smarthire;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * SmartHire — AI-Powered Multi-Tenant Hiring Platform
 *
 * @author Ganga Lova Raju Yerikireddy
 * @see <a href="https://github.com/Gangalovaraju">github.com/Gangalovaraju</a>
 */
@SpringBootApplication
@EnableAsync
public class SmartHireApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartHireApplication.class, args);
    }
}
