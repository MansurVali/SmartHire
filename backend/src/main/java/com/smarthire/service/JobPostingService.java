package com.smarthire.service;

import com.smarthire.context.TenantContextHolder;
import com.smarthire.entity.JobPosting;
import com.smarthire.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {

    private final JobPostingRepository jobRepo;

    public List<JobPosting> getAll() {
        return jobRepo.findByTenantIdOrderByCreatedAtDesc(TenantContextHolder.get());
    }

    public JobPosting getById(Long id) {
        return jobRepo.findByIdAndTenantId(id, TenantContextHolder.get())
            .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    @Transactional
    public JobPosting create(JobPosting job) {
        job.setTenantId(TenantContextHolder.get());
        job.setCreatedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        return jobRepo.save(job);
    }

    @Transactional
    public JobPosting update(Long id, JobPosting updates) {
        JobPosting existing = getById(id);
        if (updates.getTitle() != null)          existing.setTitle(updates.getTitle());
        if (updates.getDescription() != null)    existing.setDescription(updates.getDescription());
        if (updates.getRequiredSkills() != null) existing.setRequiredSkills(updates.getRequiredSkills());
        if (updates.getLocation() != null)       existing.setLocation(updates.getLocation());
        if (updates.getJobType() != null)        existing.setJobType(updates.getJobType());
        if (updates.getSalaryRange() != null)    existing.setSalaryRange(updates.getSalaryRange());
        if (updates.getStatus() != null)         existing.setStatus(updates.getStatus());
        return jobRepo.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        jobRepo.delete(getById(id));
    }
}
