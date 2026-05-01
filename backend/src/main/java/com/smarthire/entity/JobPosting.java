package com.smarthire.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "job_postings")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPosting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;

    private String location;

    @Column(name = "job_type")
    private String jobType = "FULL_TIME";

    @Column(name = "experience_years")
    private String experienceYears;

    @Column(name = "salary_range")
    private String salaryRange;

    @Enumerated(EnumType.STRING)
    private PostingStatus status = PostingStatus.OPEN;

    @Column(name = "created_by")
    private String createdBy;

    private LocalDateTime deadline;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = PostingStatus.OPEN;
    }

    public enum PostingStatus { OPEN, CLOSED, DRAFT, PAUSED }
}
