package com.smarthire.dto;

import lombok.Data;

public class AuthDTO {

    @Data
    public static class RegisterRequest {
        private String tenantId;
        private String companyName;
        private String industry;
        private String adminName;
        private String adminEmail;
        private String adminPassword;
    }

    @Data
    public static class LoginRequest {
        private String tenantId;
        private String email;
        private String password;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private String email;
        private String name;
        private String role;
        private String tenantId;
        private String companyName;
    }

    @Data
    public static class StatusUpdateRequest {
        private String status;
        private String rejectionReason;
    }

    @Data
    public static class DashboardStats {
        private long totalCandidates;
        private long shortlisted;
        private long hired;
        private long openJobs;
        private long avgAiScore;
        private long aiScreened;
        private long rejected;
    }
}
