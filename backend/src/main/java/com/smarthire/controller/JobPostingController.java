package com.smarthire.controller;

import com.smarthire.entity.JobPosting;
import com.smarthire.service.JobPostingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingService jobService;

    @GetMapping
    public ResponseEntity<List<JobPosting>> getAll() {
        return ResponseEntity.ok(jobService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPosting> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getById(id));
    }

    @PostMapping
    public ResponseEntity<JobPosting> create(@RequestBody JobPosting job) {
        return ResponseEntity.ok(jobService.create(job));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobPosting> update(@PathVariable Long id, @RequestBody JobPosting updates) {
        return ResponseEntity.ok(jobService.update(id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
