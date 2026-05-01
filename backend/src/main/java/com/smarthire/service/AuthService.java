package com.smarthire.service;

import com.smarthire.config.JwtUtils;
import com.smarthire.dto.AuthDTO.*;
import com.smarthire.entity.*;
import com.smarthire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CompanyRepository companyRepo;
    private final HrUserRepository  userRepo;
    private final PasswordEncoder   encoder;
    private final JwtUtils          jwt;

    @Transactional
    public void registerCompany(RegisterRequest req) {
        if (companyRepo.existsByTenantId(req.getTenantId()))
            throw new RuntimeException("Company ID already taken: " + req.getTenantId());

        companyRepo.save(Company.builder()
            .tenantId(req.getTenantId())
            .companyName(req.getCompanyName())
            .industry(req.getIndustry())
            .plan(Company.Plan.FREE)
            .active(true)
            .build());

        userRepo.save(HrUser.builder()
            .tenantId(req.getTenantId())
            .name(req.getAdminName())
            .email(req.getAdminEmail())
            .passwordHash(encoder.encode(req.getAdminPassword()))
            .role(HrUser.Role.ADMIN)
            .active(true)
            .build());
    }

    @Transactional
    public LoginResponse login(LoginRequest req) {
        HrUser user = userRepo.findByTenantIdAndEmail(req.getTenantId(), req.getEmail())
            .filter(u -> u.isActive() && encoder.matches(req.getPassword(), u.getPasswordHash()))
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        user.setLastLoginAt(LocalDateTime.now());
        userRepo.save(user);

        Company company = companyRepo.findByTenantId(req.getTenantId()).orElseThrow();

        String token = jwt.generate(user.getEmail(), user.getTenantId(), user.getRole().name());

        LoginResponse res = new LoginResponse();
        res.setToken(token);
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setRole(user.getRole().name());
        res.setTenantId(user.getTenantId());
        res.setCompanyName(company.getCompanyName());
        return res;
    }
}
