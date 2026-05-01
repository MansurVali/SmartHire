package com.smarthire.repository;

import com.smarthire.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    Optional<JobPosting> findByIdAndTenantId(Long id, String tenantId);
    long countByTenantIdAndStatus(String tenantId, JobPosting.PostingStatus status);
}
