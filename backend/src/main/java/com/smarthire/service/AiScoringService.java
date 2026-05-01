package com.smarthire.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiScoringService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper      objectMapper;

    @Value("${anthropic.api.key:}") private String apiKey;
    @Value("${anthropic.api.model}") private String model;
    @Value("${anthropic.api.url}")   private String apiUrl;
    @Value("${anthropic.api.timeout-seconds:30}") private int timeoutSeconds;

    public record ScoringResult(
        int score, int skillMatchPct,
        String summary, String strengths, String gaps,
        String biasFlags, String recommendation,
        String modelUsed, int processingMs
    ) {}

    public ScoringResult scoreResume(String resumeText, String jobTitle,
                                      String jobDescription, String requiredSkills) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your-api-key-here")) {
            log.warn("ANTHROPIC_API_KEY not set — using keyword fallback scoring");
            return fallbackScore(resumeText, requiredSkills);
        }

        long start = System.currentTimeMillis();
        try {
            String prompt = buildPrompt(resumeText, jobTitle, jobDescription, requiredSkills);
            Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", 1024,
                "messages", List.of(Map.of("role", "user", "content", prompt))
            );

            String rawJson = webClientBuilder.build()
                .post().uri(apiUrl)
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .block();

            int ms = (int)(System.currentTimeMillis() - start);
            return parseResponse(rawJson, model, ms);

        } catch (Exception e) {
            log.error("AI scoring failed ({}ms): {}", System.currentTimeMillis() - start, e.getMessage());
            return fallbackScore(resumeText, requiredSkills);
        }
    }

    private String buildPrompt(String resume, String title, String desc, String skills) {
        return """
            You are a senior HR recruiter and talent screening expert. Evaluate the candidate resume below against the job posting.
            
            ═══ JOB POSTING ═══
            TITLE: %s
            REQUIRED SKILLS: %s
            
            DESCRIPTION:
            %s
            
            ═══ CANDIDATE RESUME ═══
            %s
            
            ═══ INSTRUCTIONS ═══
            Return ONLY a valid JSON object — no markdown, no backticks, no explanation:
            {
              "score": <integer 0-100 — overall fit score>,
              "skillMatchPct": <integer 0-100 — % of required skills demonstrated>,
              "summary": "<2-3 sentence professional summary of the candidate's fit>",
              "strengths": "<comma-separated key strengths relevant to this role>",
              "gaps": "<comma-separated skill/experience gaps>",
              "biasFlags": "<mention any age/gender/origin/name indicators that could introduce unconscious bias, or write 'none'>",
              "recommendation": "SHORTLIST" | "HOLD" | "REJECT"
            }
            """.formatted(title, skills, desc, resume);
    }

    private ScoringResult parseResponse(String rawJson, String modelUsed, int ms) throws Exception {
        JsonNode root = objectMapper.readTree(rawJson);
        String text = root.path("content").get(0).path("text").asText();
        // Strip possible markdown fences
        text = text.replaceAll("```json", "").replaceAll("```", "").trim();
        JsonNode j = objectMapper.readTree(text);
        return new ScoringResult(
            j.path("score").asInt(50),
            j.path("skillMatchPct").asInt(50),
            j.path("summary").asText(""),
            j.path("strengths").asText(""),
            j.path("gaps").asText(""),
            j.path("biasFlags").asText("none"),
            j.path("recommendation").asText("HOLD"),
            modelUsed, ms
        );
    }

    private ScoringResult fallbackScore(String resume, String skills) {
        String lower = resume.toLowerCase();
        String[] arr = skills.toLowerCase().split("[,;\\s]+");
        long matched = Arrays.stream(arr).filter(s -> !s.isBlank() && lower.contains(s.trim())).count();
        int skillPct = arr.length > 0 ? (int)(matched * 100 / arr.length) : 50;
        int score    = Math.min(100, skillPct + 10);
        String rec   = score >= 65 ? "SHORTLIST" : score >= 45 ? "HOLD" : "REJECT";
        return new ScoringResult(score, skillPct,
            "Candidate processed via keyword analysis. Set ANTHROPIC_API_KEY for full AI screening.",
            "Matched skills: " + matched + " of " + arr.length,
            "Full AI analysis unavailable — configure ANTHROPIC_API_KEY to enable.",
            "none", rec, "keyword-fallback", 0);
    }
}
