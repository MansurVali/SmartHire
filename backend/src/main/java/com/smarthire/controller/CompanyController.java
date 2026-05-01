package com.smarthire.controller;

import com.smarthire.dto.AuthDTO.*;
import com.smarthire.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest req) {
        authService.registerCompany(req);
        return ResponseEntity.ok().build();
    }
}
