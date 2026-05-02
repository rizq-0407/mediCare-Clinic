-- =============================================
-- MediCare Clinic System — Full Database Script
-- Schema: Integrated Clinical & Billing System
-- Version: 3.0 (Updated with Staff Portal & EMR)
-- Run on: MySQL 8.0+
-- =============================================

DROP DATABASE IF EXISTS MediCareClinic;
CREATE DATABASE MediCareClinic;
USE MediCareClinic;

-- =============================================
-- TABLE: users (Central Auth Table)
-- =============================================
CREATE TABLE users (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  UNIQUE NOT NULL,
    userId       VARCHAR(20)  UNIQUE NOT NULL,   -- PAT001, DOC001, ADM001, STF001
    password     VARCHAR(255) NOT NULL,
    email        VARCHAR(100) UNIQUE NOT NULL,
    fullName     VARCHAR(100),
    contactNumber VARCHAR(20),
    role         VARCHAR(20)  NOT NULL           -- PATIENT, DOCTOR, PHARMACY, ADMIN, STAFF
);

-- =============================================
-- TABLE: employees (Staff Details)
-- =============================================
CREATE TABLE employees (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50)  UNIQUE NOT NULL,
    employeeId     VARCHAR(20)  UNIQUE NOT NULL,
    password       VARCHAR(255) NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    fullName       VARCHAR(100),
    contactNumber  VARCHAR(20),
    role           VARCHAR(20)  NOT NULL,
    specialty      VARCHAR(100),                   -- For Doctors
    qualifications TEXT,                           -- For Doctors
    salary         DOUBLE,
    hireDate       DATE DEFAULT (CURRENT_DATE)
);

-- =============================================
-- TABLE: Doctors (Doctor-specific Profiles)
-- =============================================
CREATE TABLE Doctors (
    DoctorID       BIGINT AUTO_INCREMENT PRIMARY KEY,
    Name           VARCHAR(100) NOT NULL,
    Specialty      VARCHAR(100),
    Qualification  VARCHAR(200),
    Availability   VARCHAR(200),
    Fees           DOUBLE,
    IsActive       BOOLEAN DEFAULT TRUE
);

-- =============================================
-- TABLE: Medicines (Pharmacy Inventory)
-- =============================================
CREATE TABLE Medicines (
    MedicineID    VARCHAR(20) PRIMARY KEY,
    Name          VARCHAR(100) NOT NULL,
    Category      VARCHAR(50),
    Description   VARCHAR(500),
    UnitPrice     DOUBLE       NOT NULL CHECK (UnitPrice >= 0),
    StockQuantity INT          NOT NULL CHECK (StockQuantity >= 0),
    ReorderLevel  INT          DEFAULT 10,
    ExpiryDate    DATE         NOT NULL,
    SupplierName  VARCHAR(150),
    CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Schedules (Doctor Availability Slots)
-- =============================================
CREATE TABLE Schedules (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_name      VARCHAR(100) NOT NULL,
    specialization   VARCHAR(100),
    schedule_date    VARCHAR(20),
    schedule_time    VARCHAR(50),
    available_slots  INT DEFAULT 10,
    room_number      VARCHAR(20),
    update_request   VARCHAR(500),
    requested_date   VARCHAR(20),
    requested_time   VARCHAR(50),
    requested_room   VARCHAR(20),
    admin_response   VARCHAR(500)
);

-- =============================================
-- TABLE: Appointments (Bookings)
-- =============================================
CREATE TABLE Appointments (
    AppointmentID    BIGINT AUTO_INCREMENT PRIMARY KEY,
    PatientName      VARCHAR(100) NOT NULL,
    PatientId        VARCHAR(20),
    DoctorName       VARCHAR(100) NOT NULL,
    Specialty        VARCHAR(100) NOT NULL,
    AppointmentDate  DATETIME NOT NULL,
    Symptoms         TEXT,
    Status           VARCHAR(20) DEFAULT 'Scheduled', -- Scheduled, Pending, Completed, Cancelled
    Notes            TEXT,
    CreatedAt        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: MedicalRecords (Electronic Medical Records)
-- =============================================
CREATE TABLE MedicalRecords (
    RecordID             BIGINT AUTO_INCREMENT PRIMARY KEY,
    PatientFullName      VARCHAR(100) NOT NULL,
    PatientUsername      VARCHAR(50),
    DateOfBirth          DATE,
    Gender               VARCHAR(20),
    BloodGroup           VARCHAR(10),
    Allergies            TEXT,
    AttendingDoctor      VARCHAR(100),
    VisitDate            DATE NOT NULL,
    NextVisitFollowUpDate DATE,
    Status               VARCHAR(50) DEFAULT 'Active',
    diagnosis            TEXT,
    notes                TEXT,
    CreatedAt            DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Prescriptions (Doctor Orders)
-- =============================================
CREATE TABLE Prescriptions (
    PrescriptionID   VARCHAR(20) PRIMARY KEY,
    PatientID        VARCHAR(20) NOT NULL,
    DoctorID         VARCHAR(20) NOT NULL,
    PrescriptionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Notes            TEXT,
    Status           VARCHAR(20) DEFAULT 'Pending' -- Pending, Dispensed
);

-- =============================================
-- TABLE: PrescriptionItems (Meds in Prescription)
-- =============================================
CREATE TABLE PrescriptionItems (
    PrescriptionItemID VARCHAR(20) PRIMARY KEY,
    PrescriptionID     VARCHAR(20),
    MedicineID         VARCHAR(20),
    Quantity           INT NOT NULL,
    Dosage             VARCHAR(100),
    Duration           VARCHAR(100),
    FOREIGN KEY (PrescriptionID) REFERENCES Prescriptions(PrescriptionID) ON DELETE CASCADE,
    FOREIGN KEY (MedicineID)     REFERENCES Medicines(MedicineID)
);

-- =============================================
-- TABLE: Invoices (Billing)
-- =============================================
CREATE TABLE Invoices (
    InvoiceID     VARCHAR(10) PRIMARY KEY,
    PatientID     VARCHAR(10) NOT NULL,
    PatientName   VARCHAR(100),
    TotalAmount   DECIMAL(10, 2) NOT NULL,
    Status        VARCHAR(20) DEFAULT 'UNPAID',  -- PAID, UNPAID, OVERDUE
    IssuedDate    DATETIME DEFAULT CURRENT_TIMESTAMP,
    DueDate       DATETIME
);

-- =============================================
-- TABLE: Payments (Stripe/Manual)
-- =============================================
CREATE TABLE Payments (
    PaymentID            VARCHAR(10) PRIMARY KEY,
    InvoiceID            VARCHAR(10) NOT NULL,
    AmountPaid           DECIMAL(10, 2) NOT NULL,
    PaymentMethod        VARCHAR(50),
    PaymentStatus        VARCHAR(20) DEFAULT 'COMPLETED',
    PaymentDate          DATETIME DEFAULT CURRENT_TIMESTAMP,
    StripeTransactionID  VARCHAR(100),
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
);

-- =============================================
-- TABLE: Tickets (Support System)
-- =============================================
CREATE TABLE Tickets (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticketId         VARCHAR(20) UNIQUE NOT NULL,
    patientId        VARCHAR(20) NOT NULL,
    subject          VARCHAR(255) NOT NULL,
    description      LONGTEXT NOT NULL,
    status           VARCHAR(30) DEFAULT 'OPEN',
    priority         VARCHAR(20) DEFAULT 'MEDIUM',
    category         VARCHAR(100),
    assignedAdminId  VARCHAR(20),
    adminReply       LONGTEXT,
    repliedBy        VARCHAR(50),
    firstResponseAt  DATETIME,
    closedAt         DATETIME,
    createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Feedback (Satisfaction)
-- =============================================
CREATE TABLE Feedback (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    feedbackId       VARCHAR(20) UNIQUE NOT NULL,
    patientName      VARCHAR(100),
    rating           INT CHECK (rating BETWEEN 1 AND 5),
    comments         LONGTEXT,
    experienceDate   DATE,
    clinicService    VARCHAR(100),
    isPublic         BOOLEAN DEFAULT FALSE,
    adminReply       LONGTEXT,
    repliedBy        VARCHAR(100),
    firstResponseAt  DATETIME,
    createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- SAMPLE DATA: SEEDING (password123 bcrypt)
-- =============================================

INSERT INTO users (username, userId, password, email, fullName, contactNumber, role) VALUES
('admin',      'ADM001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'admin@medicare.com',  'System Admin',      '5550001', 'ADMIN'),
('drjames',    'DOC001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'james@medicare.com',  'Dr. James Wilson',  '5550002', 'DOCTOR'),
('pharma_one', 'PHM001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'store@medicare.com',  'Sarah Pharma',      '5550003', 'PHARMACY'),
('staff_one',  'STF001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'staff@medicare.com',  'Alex Reception',    '5550004', 'STAFF'),
('johndoe',    'PAT001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'john@gmail.com',      'John Doe',          '5550101', 'PATIENT'),
('janesmith',  'PAT002', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'jane@gmail.com',      'Jane Smith',        '5550102', 'PATIENT');

INSERT INTO employees (username, employeeId, password, email, fullName, role, specialty, salary) VALUES
('admin',      'ADM001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'admin@medicare.com',  'System Admin',      'ADMIN',    NULL, 85000),
('drjames',    'DOC001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'james@medicare.com',  'Dr. James Wilson',  'DOCTOR',   'Cardiology', 120000),
('pharma_one', 'PHM001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'store@medicare.com',  'Sarah Pharma',      'PHARMACY', NULL, 60000),
('staff_one',  'STF001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'staff@medicare.com',  'Alex Reception',    'STAFF',    NULL, 45000);

-- Seeding Doctors Profile
INSERT INTO Doctors (Name, Specialty, Qualification, Availability, Fees) VALUES
('Dr. James Wilson', 'Cardiology', 'MBBS, MD', 'Mon,Wed,Fri (09:00 - 17:00)', 500.0);

-- Seeding Medicines
INSERT INTO Medicines (MedicineID, Name, Category, Description, UnitPrice, StockQuantity, ReorderLevel, ExpiryDate, SupplierName) VALUES
('MED001', 'Paracetamol', 'Analgesic',   'Fever and pain relief', 5.00,  100, 20, '2026-12-31', 'BioLabs Ltd'),
('MED002', 'Amoxicillin', 'Antibiotic',  'Infection treatment',  12.50,  50,  10, '2025-11-30', 'PharmaCorp'),
('MED003', 'Cetirizine',  'Antiallergic','Allergy relief',        8.00,  80,  15, '2026-06-15', 'Global Pharma');

-- Seeding Schedules
INSERT INTO Schedules (doctor_name, specialization, schedule_date, schedule_time, available_slots, room_number) VALUES
('Dr. James Wilson', 'Cardiology',   '2026-06-10', '09:00', 10, 'Room 101'),
('Dr. James Wilson', 'Cardiology',   '2026-06-12', '14:00', 8,  'Room 101'),
('Sarah Doctor',     'Dermatology',  '2026-06-11', '10:00', 5,  'Room 205'),
('Dr. James Wilson', 'General',      '2026-06-15', '11:00', 12, 'Room 102');

-- Seeding Appointments
INSERT INTO Appointments (PatientName, PatientId, DoctorName, Specialty, AppointmentDate, Symptoms, Status) VALUES
('John Doe',   'PAT001', 'Dr. James Wilson', 'Cardiology', '2026-06-10 09:30:00', 'Chest pain, shortness of breath', 'Scheduled'),
('Jane Smith', 'PAT002', 'Dr. James Wilson', 'Cardiology', '2026-06-12 14:15:00', 'Routine checkup',                  'Scheduled');

-- Seeding Medical Records (EMR)
INSERT INTO MedicalRecords (PatientFullName, PatientUsername, DateOfBirth, Gender, BloodGroup, Allergies, AttendingDoctor, VisitDate, Status, diagnosis, notes) VALUES
('John Doe',   'johndoe', '1985-05-15', 'Male', 'O+', 'Pollen, Dust', 'Dr. James Wilson', '2026-04-01', 'Active', 'Hypertension', 'Regular monitoring, low salt diet.'),
('Jane Smith', 'janesmith','1992-10-22', 'Female','A-', 'None',         'Dr. James Wilson', '2026-04-05', 'Active', 'Seasonal Allergies', 'Antihistamines prescribed.');

-- Seeding Prescriptions
INSERT INTO Prescriptions (PrescriptionID, PatientID, DoctorID, Notes, Status) VALUES
('PRES-001', 'PAT001', 'DOC001', 'Take meds with water after lunch', 'Pending'),
('PRES-002', 'PAT002', 'DOC001', 'Avoid cold drinks', 'Dispensed');

INSERT INTO PrescriptionItems (PrescriptionItemID, PrescriptionID, MedicineID, Quantity, Dosage, Duration) VALUES
('PI-001', 'PRES-001', 'MED001', 10, '500mg BID', '5 Days'),
('PI-002', 'PRES-001', 'MED003', 5,  '10mg OD',  '5 Days'),
('PI-003', 'PRES-002', 'MED002', 15, '250mg TID', '5 Days');

-- Seeding Billing Data
INSERT INTO Invoices (InvoiceID, PatientID, PatientName, TotalAmount, Status, DueDate) VALUES
('INV-1001', 'PAT001', 'John Doe', 1500.00, 'UNPAID', '2026-04-30'),
('INV-1002', 'PAT002', 'Jane Smith', 850.50, 'PAID',   '2026-04-28');

INSERT INTO Payments (PaymentID, InvoiceID, AmountPaid, PaymentMethod, PaymentStatus, StripeTransactionID) VALUES
('PAY-2001', 'INV-1002', 850.50, 'Credit Card', 'COMPLETED', 'txn_stripe_sample_123');

-- Seeding Support Tickets
INSERT INTO Tickets (ticketId, patientId, subject, description, status, priority, category) VALUES
('TCK-101', 'PAT001', 'Login Issue', 'Cannot log in from mobile device', 'OPEN', 'HIGH', 'Technical'),
('TCK-102', 'PAT002', 'Billing Query','Invoice INV-1002 shows extra charges', 'RESOLVED', 'MEDIUM', 'Billing');

-- Seeding Feedback
INSERT INTO Feedback (patientId, patientName, rating, comment, experienceDate, clinicService) VALUES
('PAT001', 'John Doe', 5, 'Great service by Dr. James!', '2026-04-10', 'Cardiology'),
('PAT002', 'Jane Smith', 4, 'Very clean facility.', '2026-04-12', 'General');