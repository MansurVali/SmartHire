-- ============================================================
-- SmartHire — AI-Powered Hiring Platform
-- Database Schema (PostgreSQL)
-- Author: Ganga Lova Raju Yerikireddy
-- GitHub: https://github.com/Gangalovaraju
-- ============================================================

-- Drop and recreate for clean setup
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS hr_users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- ── COMPANIES (Tenants) ─────────────────────────────────────
CREATE TABLE companies (
    id           BIGSERIAL PRIMARY KEY,
    tenant_id    VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(200) NOT NULL,
    industry     VARCHAR(100),
    website      VARCHAR(255),
    logo_url     VARCHAR(500),
    plan         VARCHAR(20)  NOT NULL DEFAULT 'FREE',  -- FREE | PRO | ENTERPRISE
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_tenant_id ON companies(tenant_id);

-- ── HR USERS ────────────────────────────────────────────────
CREATE TABLE hr_users (
    id            BIGSERIAL PRIMARY KEY,
    tenant_id     VARCHAR(100) NOT NULL REFERENCES companies(tenant_id) ON DELETE CASCADE,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'RECRUITER',  -- ADMIN | RECRUITER | VIEWER
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, email)
);

CREATE INDEX idx_hr_users_tenant_id ON hr_users(tenant_id);
CREATE INDEX idx_hr_users_email     ON hr_users(email);

-- ── JOB POSTINGS ────────────────────────────────────────────
CREATE TABLE job_postings (
    id               BIGSERIAL PRIMARY KEY,
    tenant_id        VARCHAR(100) NOT NULL REFERENCES companies(tenant_id) ON DELETE CASCADE,
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    required_skills  TEXT,                     -- comma-separated
    location         VARCHAR(150),
    job_type         VARCHAR(30)  DEFAULT 'FULL_TIME',  -- FULL_TIME | PART_TIME | CONTRACT | REMOTE
    experience_years VARCHAR(30),              -- e.g. "3-5 years"
    salary_range     VARCHAR(60),              -- e.g. "$80k–$120k"
    status           VARCHAR(20)  NOT NULL DEFAULT 'OPEN',  -- OPEN | CLOSED | DRAFT | PAUSED
    created_by       VARCHAR(150),
    deadline         TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_tenant_id ON job_postings(tenant_id);
CREATE INDEX idx_jobs_status    ON job_postings(tenant_id, status);

-- ── CANDIDATES ──────────────────────────────────────────────
CREATE TABLE candidates (
    id               BIGSERIAL PRIMARY KEY,
    tenant_id        VARCHAR(100) NOT NULL REFERENCES companies(tenant_id) ON DELETE CASCADE,
    job_posting_id   BIGINT       NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    name             VARCHAR(150) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    phone            VARCHAR(30),
    resume_text      TEXT,                     -- pasted / extracted resume content
    linkedin_url     VARCHAR(500),
    portfolio_url    VARCHAR(500),

    -- AI Scoring Fields
    ai_score         INTEGER,                  -- 0–100
    skill_match_pct  INTEGER,                  -- 0–100
    ai_summary       TEXT,
    ai_strengths     TEXT,
    ai_gaps          TEXT,
    bias_flags       TEXT,
    ai_recommendation VARCHAR(20),             -- SHORTLIST | HOLD | REJECT
    ai_model_used    VARCHAR(60),
    ai_processing_ms INTEGER,                  -- latency in ms

    -- Status & Workflow
    status           VARCHAR(30)  NOT NULL DEFAULT 'APPLIED',
    -- APPLIED | AI_SCREENING | SHORTLISTED | INTERVIEW_SCHEDULED | INTERVIEWED | OFFER_SENT | HIRED | REJECTED

    rejection_reason TEXT,
    notes            TEXT,                     -- HR internal notes
    applied_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    ai_processed_at  TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, job_posting_id, email)
);

CREATE INDEX idx_candidates_tenant_id      ON candidates(tenant_id);
CREATE INDEX idx_candidates_job_posting_id ON candidates(tenant_id, job_posting_id);
CREATE INDEX idx_candidates_ai_score       ON candidates(tenant_id, ai_score DESC);
CREATE INDEX idx_candidates_status         ON candidates(tenant_id, status);

-- ── TRIGGERS: auto-update updated_at ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at    BEFORE UPDATE ON companies    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_candidates_updated_at   BEFORE UPDATE ON candidates   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── SEED DATA (demo tenants) ─────────────────────────────────
INSERT INTO companies (tenant_id, company_name, industry, plan) VALUES
  ('acme-corp',   'Acme Corporation',   'Technology',   'PRO'),
  ('nexgen-tech', 'NexGen Technologies','Finance',      'FREE');

INSERT INTO hr_users (tenant_id, name, email, password_hash, role) VALUES
  ('acme-corp',   'Alice Admin',  'admin@acme.com',   '$2a$12$KIXx2p7y0.oB5YnEFJ/nLemCEA3YhNXJUJ0hwU68Y0mJD5Q3Pvqee', 'ADMIN'),
  ('nexgen-tech', 'Bob Recruiter','bob@nexgen.com',   '$2a$12$KIXx2p7y0.oB5YnEFJ/nLemCEA3YhNXJUJ0hwU68Y0mJD5Q3Pvqee', 'RECRUITER');
-- ^ Both passwords = "password123"

INSERT INTO job_postings (tenant_id, title, description, required_skills, location, job_type, experience_years, salary_range, created_by) VALUES
  ('acme-corp', 'Senior Java Full Stack Developer',
   'We are looking for an experienced Java Full Stack Developer to lead our platform engineering team. You will be working on microservices architecture, designing RESTful APIs, and building responsive React frontends for our enterprise SaaS product.',
   'Java, Spring Boot, React.js, PostgreSQL, Microservices, Docker, REST APIs',
   'Hyderabad, India', 'FULL_TIME', '3-5 years', '₹18L–₹28L/yr', 'Alice Admin'),

  ('acme-corp', 'React Frontend Engineer',
   'Join our growing frontend team to build world-class user interfaces. You will work closely with product and design to ship fast, accessible, and beautiful web applications.',
   'React.js, TypeScript, Redux, CSS-in-JS, REST APIs, Git, Jest',
   'Remote', 'FULL_TIME', '2-4 years', '₹14L–₹22L/yr', 'Alice Admin'),

  ('nexgen-tech', 'DevOps Engineer',
   'Looking for a DevOps Engineer to own our CI/CD pipelines, cloud infrastructure, and site reliability. You will be instrumental in our move to Kubernetes-based deployments.',
   'AWS, Docker, Kubernetes, Terraform, CI/CD, Linux, Python',
   'Bangalore, India', 'FULL_TIME', '3-6 years', '₹20L–₹35L/yr', 'Bob Recruiter');
