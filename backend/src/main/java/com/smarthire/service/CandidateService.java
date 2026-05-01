package com.smarthire.service;

import com.smarthire.context.TenantContextHolder;
import com.smarthire.dto.AuthDTO.*;
import com.smarthire.entity.*;
import com.smarthire.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateService {

    private final CandidateRepository   candidateRepo;
    private final JobPostingRepository  jobRepo;
    private final AiScoringService      aiScoring;
    private final SimpMessagingTemplate ws;

    public List<Candidate> getByJob(Long jobId) {
        return candidateRepo.findByTenantIdAndJobPostingIdOrderByAiScoreDesc(
            TenantContextHolder.get(), jobId);
    }

    public List<Candidate> getAll() {
        return candidateRepo.findAllByTenantIdOrderByAppliedAtDesc(TenantContextHolder.get());
    }

    public Candidate getById(Long id) {
        return candidateRepo.findByIdAndTenantId(id, TenantContextHolder.get())
            .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }

    @Transactional
    public Candidate submitApplication(Candidate candidate) {
        String tenantId = TenantContextHolder.get();
        candidate.setTenantId(tenantId);
        Candidate saved = candidateRepo.save(candidate);
        // Fire-and-forget AI pipeline
        triggerAiScoring(saved.getId(), tenantId);
        return saved;
    }

    @Async
    @Transactional
    public void triggerAiScoring(Long candidateId, String tenantId) {
        try {
            Candidate c = candidateRepo.findById(candidateId).orElseThrow();
            c.setStatus(Candidate.CandidateStatus.AI_SCREENING);
            candidateRepo.save(c);

            broadcast(tenantId, Map.of(
                "event", "SCREENING_STARTED",
                "candidateId", candidateId,
                "name", c.getName()
            ));

            JobPosting job = jobRepo.findById(c.getJobPostingId()).orElseThrow();

            AiScoringService.ScoringResult result = aiScoring.scoreResume(
                c.getResumeText(), job.getTitle(), job.getDescription(), job.getRequiredSkills()
            );

            c.setAiScore(result.score());
            c.setSkillMatchPct(result.skillMatchPct());
            c.setAiSummary(result.summary());
            c.setAiStrengths(result.strengths());
            c.setAiGaps(result.gaps());
            c.setBiasFlags(result.biasFlags());
            c.setAiRecommendation(result.recommendation());
            c.setAiModelUsed(result.modelUsed());
            c.setAiProcessingMs(result.processingMs());
            c.setAiProcessedAt(LocalDateTime.now());

            c.setStatus("SHORTLIST".equals(result.recommendation())
                ? Candidate.CandidateStatus.SHORTLISTED
                : Candidate.CandidateStatus.APPLIED);

            candidateRepo.save(c);

            broadcast(tenantId, Map.of(
                "event", "SCORING_COMPLETE",
                "candidateId", candidateId,
                "name", c.getName(),
                "score", result.score(),
                "skillMatchPct", result.skillMatchPct(),
                "recommendation", result.recommendation(),
                "processingMs", result.processingMs()
            ));

            log.info("✅ AI scored {} (job={}) — {}/100 in {}ms",
                c.getName(), job.getTitle(), result.score(), result.processingMs());

        } catch (Exception e) {
            log.error("❌ AI scoring failed for candidateId={}: {}", candidateId, e.getMessage());
            broadcast(tenantId, Map.of(
                "event", "SCORING_FAILED",
                "candidateId", candidateId,
                "error", e.getMessage()
            ));
        }
    }

    @Transactional
    public Candidate updateStatus(Long id, String status, String rejectionReason) {
        Candidate c = getById(id);
        c.setStatus(Candidate.CandidateStatus.valueOf(status));
        if (rejectionReason != null) c.setRejectionReason(rejectionReason);
        return candidateRepo.save(c);
    }

    public DashboardStats getDashboardStats() {
        String t = TenantContextHolder.get();
        DashboardStats stats = new DashboardStats();
        stats.setTotalCandidates(candidateRepo.findAllByTenantIdOrderByAppliedAtDesc(t).size());
        stats.setShortlisted(candidateRepo.countByTenantIdAndStatus(t, Candidate.CandidateStatus.SHORTLISTED));
        stats.setHired(candidateRepo.countByTenantIdAndStatus(t, Candidate.CandidateStatus.HIRED));
        stats.setRejected(candidateRepo.countByTenantIdAndStatus(t, Candidate.CandidateStatus.REJECTED));
        stats.setAvgAiScore(Math.round(candidateRepo.avgAiScoreByTenantId(t)));
        stats.setOpenJobs(jobRepo.countByTenantIdAndStatus(t, JobPosting.PostingStatus.OPEN));
        return stats;
    }

    private void broadcast(String tenantId, Map<String, Object> payload) {
        try { ws.convertAndSend("/topic/screening/" + tenantId, payload); }
        catch (Exception e) { log.warn("WebSocket broadcast failed: {}", e.getMessage()); }
    }
}
