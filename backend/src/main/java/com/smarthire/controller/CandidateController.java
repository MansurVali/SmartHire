package com.smarthire.controller;

import com.smarthire.dto.AuthDTO.*;
import com.smarthire.entity.Candidate;
import com.smarthire.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    public ResponseEntity<List<Candidate>> getAll() {
        return ResponseEntity.ok(candidateService.getAll());
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Candidate>> getByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(candidateService.getByJob(jobId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getById(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Candidate> submit(@RequestBody Candidate candidate) {
        return ResponseEntity.ok(candidateService.submitApplication(candidate));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Candidate> updateStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(
            candidateService.updateStatus(id, body.get("status"), body.get("rejectionReason"))
        );
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> dashboard() {
        return ResponseEntity.ok(candidateService.getDashboardStats());
    }
}
