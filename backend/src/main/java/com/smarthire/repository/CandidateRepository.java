package com.smarthire.repository;

import com.smarthire.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByTenantIdAndJobPostingIdOrderByAiScoreDesc(String tenantId, Long jobPostingId);
    List<Candidate> findAllByTenantIdOrderByAppliedAtDesc(String tenantId);
    Optional<Candidate> findByIdAndTenantId(Long id, String tenantId);
    long countByTenantIdAndStatus(String tenantId, Candidate.CandidateStatus status);

    @Query("SELECT COALESCE(AVG(c.aiScore), 0) FROM Candidate c WHERE c.tenantId = :tenantId AND c.aiScore IS NOT NULL")
    double avgAiScoreByTenantId(String tenantId);
}
