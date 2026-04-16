-- =============================================
-- MediCare Clinic - Tickets & Feedback Schema
-- Location: project root (beside database_setup.sql)
-- Target: MySQL 8+
-- =============================================

USE MediCareClinic;

-- =============================================
-- TABLE: Tickets
-- =============================================
CREATE TABLE IF NOT EXISTS Tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticketId VARCHAR(50) NOT NULL UNIQUE,
    patientId VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    category VARCHAR(100),
    assignedAdminId VARCHAR(50),
    adminReply LONGTEXT,
    repliedBy VARCHAR(50),
    firstResponseAt DATETIME,
    closedAt DATETIME,
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Add newly implemented columns safely for existing installations
ALTER TABLE Tickets ADD COLUMN IF NOT EXISTS assignedAdminId VARCHAR(50);
ALTER TABLE Tickets ADD COLUMN IF NOT EXISTS adminReply LONGTEXT;
ALTER TABLE Tickets ADD COLUMN IF NOT EXISTS repliedBy VARCHAR(50);
ALTER TABLE Tickets ADD COLUMN IF NOT EXISTS firstResponseAt DATETIME;
ALTER TABLE Tickets ADD COLUMN IF NOT EXISTS closedAt DATETIME;
ALTER TABLE Tickets ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE Tickets ADD COLUMN IF NOT EXISTS createdAt DATETIME;
ALTER TABLE Tickets ADD COLUMN IF NOT EXISTS updatedAt DATETIME;

CREATE INDEX IF NOT EXISTS idx_tickets_ticketId ON Tickets(ticketId);
CREATE INDEX IF NOT EXISTS idx_tickets_patientId ON Tickets(patientId);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON Tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_createdAt ON Tickets(createdAt);

-- =============================================
-- TABLE: Feedback
-- =============================================
CREATE TABLE IF NOT EXISTS Feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    feedbackId VARCHAR(50) NOT NULL UNIQUE,
    patientId VARCHAR(50) NOT NULL,
    rating INT NOT NULL,
    comments LONGTEXT,
    isPublic BOOLEAN NOT NULL DEFAULT FALSE,
    adminReply LONGTEXT,
    repliedBy VARCHAR(50),
    firstResponseAt DATETIME,
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Add newly implemented columns safely for existing installations
ALTER TABLE Feedback ADD COLUMN IF NOT EXISTS adminReply LONGTEXT;
ALTER TABLE Feedback ADD COLUMN IF NOT EXISTS repliedBy VARCHAR(50);
ALTER TABLE Feedback ADD COLUMN IF NOT EXISTS firstResponseAt DATETIME;
ALTER TABLE Feedback ADD COLUMN IF NOT EXISTS createdAt DATETIME;
ALTER TABLE Feedback ADD COLUMN IF NOT EXISTS updatedAt DATETIME;

CREATE INDEX IF NOT EXISTS idx_feedback_feedbackId ON Feedback(feedbackId);
CREATE INDEX IF NOT EXISTS idx_feedback_patientId ON Feedback(patientId);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON Feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_createdAt ON Feedback(createdAt);
