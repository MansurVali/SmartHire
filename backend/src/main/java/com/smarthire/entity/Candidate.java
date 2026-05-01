package com.smarthire.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "candidates")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "job_posting_id", nullable = false)
    private Long jobPostingId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Column(name = "resume_text", columnDefinition = "TEXT")
    private String resumeText;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    // ── AI Scoring ────────────────────────────────────────────
    @Column(name = "ai_score")
    private Integer aiScore;

    @Column(name = "skill_match_pct")
    private Integer skillMatchPct;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "ai_strengths", columnDefinition = "TEXT")
    private String aiStrengths;

    @Column(name = "ai_gaps", columnDefinition = "TEXT")
    private String aiGaps;

    @Column(name = "bias_flags", columnDefinition = "TEXT")
    private String biasFlags;

    @Column(name = "ai_recommendation")
    private String aiRecommendation;

    @Column(name = "ai_model_used")
    private String aiModelUsed;

    @Column(name = "ai_processing_ms")
    private Integer aiProcessingMs;

    // ── Status ────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    private CandidateStatus status = CandidateStatus.APPLIED;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    private String notes;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    @Column(name = "ai_processed_at")
    private LocalDateTime aiProcessedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        appliedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = CandidateStatus.APPLIED;
    }

    public enum CandidateStatus {
        APPLIED, AI_SCREENING, SHORTLISTED,
        INTERVIEW_SCHEDULED, INTERVIEWED,
        OFFER_SENT, HIRED, REJECTED
    }
}
