-- =============================================
-- MediCare Clinic - Ticket & Feedback Module
-- Database Schema Extension
-- Run on: MySQL (MediCareClinic database)
-- =============================================

USE MediCareClinic;

-- =============================================
-- TABLE: Tickets (Patient Support Tickets)
-- =============================================
CREATE TABLE IF NOT EXISTS Tickets (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticketId            VARCHAR(20)  UNIQUE NOT NULL,          -- TKT0001, TKT0002, etc.
    patientId           VARCHAR(20)  NOT NULL,                 -- FK → users.userId
    subject             VARCHAR(255) NOT NULL,
    description         TEXT         NOT NULL,
    status              VARCHAR(20)  DEFAULT 'OPEN',           -- OPEN, IN-PROGRESS, WAITING-FOR-PATIENT, RESOLVED, CLOSED
    priority            VARCHAR(20)  DEFAULT 'MEDIUM',         -- URGENT, HIGH, MEDIUM, LOW
    category            VARCHAR(100),                          -- Appointment, Prescription, Medicine, Billing, etc.
    assignedAdminId     VARCHAR(20),                           -- FK → employees.employeeId (Admin/Staff)
    adminReply          LONGTEXT,                              -- Reply from admin
    repliedBy           VARCHAR(20),                           -- employeeId of admin who replied
    firstResponseAt     DATETIME,                              -- When first response was given
    closedAt            DATETIME,                              -- When ticket was closed
    createdAt           DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ticket_patient FOREIGN KEY (patientId) REFERENCES users(userId),
    CONSTRAINT fk_ticket_admin FOREIGN KEY (assignedAdminId) REFERENCES employees(employeeId),
    CONSTRAINT fk_ticket_replier FOREIGN KEY (repliedBy) REFERENCES employees(employeeId)
);

-- =============================================
-- TABLE: Feedback (Patient Feedback & Reviews)
-- =============================================
CREATE TABLE IF NOT EXISTS Feedback (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    feedbackId          VARCHAR(20)  UNIQUE NOT NULL,          -- FB0001, FB0002, etc.
    patientId           VARCHAR(20)  NOT NULL,                 -- FK → users.userId
    rating              INT          NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments            TEXT,
    isPublic            BOOLEAN      DEFAULT FALSE,            -- Whether feedback is visible to others
    createdAt           DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_feedback_patient FOREIGN KEY (patientId) REFERENCES users(userId)
);

-- =============================================
-- TABLE: Notifications (Real-time User Notifications)
-- =============================================
CREATE TABLE IF NOT EXISTS Notifications (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    notificationId      VARCHAR(20)  UNIQUE NOT NULL,
    recipientRole       VARCHAR(20)  NOT NULL,                 -- PATIENT, ADMIN, DOCTOR, PHARMACY
    recipientId         VARCHAR(20)  NOT NULL,                 -- userId or employeeId
    type                VARCHAR(50)  NOT NULL,                 -- TICKET_CREATED, TICKET_UPDATED, TICKET_ASSIGNED, FEEDBACK_SUBMITTED, etc.
    title               VARCHAR(255) NOT NULL,
    message             LONGTEXT,
    ticketId            VARCHAR(20),                           -- Reference to related ticket if applicable
    isRead              BOOLEAN      DEFAULT FALSE,
    createdAt           DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_ticket FOREIGN KEY (ticketId) REFERENCES Tickets(ticketId) ON DELETE SET NULL
);

-- =============================================
-- TABLE: Attachments (Ticket & Feedback Attachments)
-- =============================================
CREATE TABLE IF NOT EXISTS Attachments (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    attachmentId        VARCHAR(20)  UNIQUE NOT NULL,
    ticketId            VARCHAR(20),                           -- FK → Tickets.ticketId (nullable for feedback attachments)
    fileName            VARCHAR(255) NOT NULL,
    fileType            VARCHAR(50),                           -- mime type: application/pdf, image/png, etc.
    filePath            VARCHAR(500) NOT NULL,                 -- Storage path on server
    fileSize            BIGINT       NOT NULL,                 -- In bytes
    uploadedAt          DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attachment_ticket FOREIGN KEY (ticketId) REFERENCES Tickets(ticketId) ON DELETE CASCADE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_tickets_patientId      ON Tickets(patientId);
CREATE INDEX idx_tickets_assignedAdminId ON Tickets(assignedAdminId);
CREATE INDEX idx_tickets_status          ON Tickets(status);
CREATE INDEX idx_tickets_priority        ON Tickets(priority);
CREATE INDEX idx_tickets_category        ON Tickets(category);
CREATE INDEX idx_tickets_createdAt       ON Tickets(createdAt);
CREATE INDEX idx_tickets_updatedAt       ON Tickets(updatedAt);
CREATE INDEX idx_tickets_ticketId        ON Tickets(ticketId);

CREATE INDEX idx_feedback_patientId      ON Feedback(patientId);
CREATE INDEX idx_feedback_isPublic       ON Feedback(isPublic);
CREATE INDEX idx_feedback_rating         ON Feedback(rating);
CREATE INDEX idx_feedback_createdAt      ON Feedback(createdAt);

CREATE INDEX idx_notifications_recipientId ON Notifications(recipientId);
CREATE INDEX idx_notifications_recipientRole ON Notifications(recipientRole);
CREATE INDEX idx_notifications_type      ON Notifications(type);
CREATE INDEX idx_notifications_isRead    ON Notifications(isRead);
CREATE INDEX idx_notifications_createdAt ON Notifications(createdAt);
CREATE INDEX idx_notifications_ticketId  ON Notifications(ticketId);

CREATE INDEX idx_attachments_ticketId    ON Attachments(ticketId);
CREATE INDEX idx_attachments_uploadedAt  ON Attachments(uploadedAt);

-- =============================================
-- STORED PROCEDURE: Generate Ticket ID
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_GenerateTicketId(OUT p_ticketId VARCHAR(20))
BEGIN
    DECLARE v_nextNum INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticketId, 4) AS UNSIGNED)), 0) + 1 
    INTO v_nextNum FROM Tickets;
    SET p_ticketId = CONCAT('TKT', LPAD(v_nextNum, 4, '0'));
END$$

DELIMITER ;

-- =============================================
-- STORED PROCEDURE: Generate Feedback ID
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_GenerateFeedbackId(OUT p_feedbackId VARCHAR(20))
BEGIN
    DECLARE v_nextNum INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(feedbackId, 3) AS UNSIGNED)), 0) + 1 
    INTO v_nextNum FROM Feedback;
    SET p_feedbackId = CONCAT('FB', LPAD(v_nextNum, 4, '0'));
END$$

DELIMITER ;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Sample Ticket
INSERT INTO Tickets (ticketId, patientId, subject, description, status, priority, category, createdAt)
VALUES ('TKT0001', 'PAT001', 'Cannot access prescription', 'I cannot view my recent prescriptions in the system', 'OPEN', 'HIGH', 'Prescription', NOW());

-- Sample Feedback
INSERT INTO Feedback (feedbackId, patientId, rating, comments, isPublic, createdAt)
VALUES ('FB0001', 'PAT001', 5, 'Great service and quick response!', TRUE, NOW());

-- Sample Notification
INSERT INTO Notifications (notificationId, recipientRole, recipientId, type, title, message, ticketId, isRead, createdAt)
VALUES ('NOTIF0001', 'PATIENT', 'PAT001', 'TICKET_CREATED', 'Ticket Created', 'Your support ticket TKT0001 has been created successfully', 'TKT0001', FALSE, NOW());

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Ticket Summary with Patient and Admin Names
CREATE OR REPLACE VIEW vw_TicketSummary AS
SELECT
    t.ticketId,
    t.patientId,
    u.fullName AS patientName,
    t.subject,
    t.status,
    t.priority,
    t.category,
    t.assignedAdminId,
    COALESCE(e.fullName, 'Unassigned') AS assignedAdminName,
    t.createdAt,
    t.updatedAt,
    DATEDIFF(NOW(), t.createdAt) AS ageInDays
FROM Tickets t
LEFT JOIN users u ON u.userId = t.patientId
LEFT JOIN employees e ON e.employeeId = t.assignedAdminId;

-- Open Tickets Needing Attention
CREATE OR REPLACE VIEW vw_OpenTickets AS
SELECT
    ticketId,
    patientId,
    subject,
    status,
    priority,
    category,
    createdAt,
    DATEDIFF(NOW(), createdAt) AS ageInDays
FROM Tickets
WHERE status IN ('OPEN', 'IN-PROGRESS', 'WAITING-FOR-PATIENT')
ORDER BY priority DESC, createdAt ASC;

-- Public Feedback
CREATE OR REPLACE VIEW vw_PublicFeedback AS
SELECT
    f.feedbackId,
    f.patientId,
    u.fullName AS patientName,
    f.rating,
    f.comments,
    f.createdAt,
    ROUND(AVG(f.rating) OVER (), 2) AS avgRating
FROM Feedback f
JOIN users u ON u.userId = f.patientId
WHERE f.isPublic = TRUE
ORDER BY f.createdAt DESC;

-- =============================================
-- END OF MIGRATION SCRIPT
-- =============================================
