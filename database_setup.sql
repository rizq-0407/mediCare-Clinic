-- =============================================
-- MediCare Clinic System — Full Database Script
-- Schema: Dual-table (users + employees)
-- Run on: MySQL
-- =============================================

-- =============================================
-- DROP & CREATE DATABASE
-- =============================================
DROP DATABASE IF EXISTS MediCareClinic;
CREATE DATABASE MediCareClinic;
USE MediCareClinic;

-- =============================================
-- TABLE: users (Patients only — public registration)
-- =============================================
CREATE TABLE users (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  UNIQUE NOT NULL,
    userId       VARCHAR(20)  UNIQUE NOT NULL,   -- e.g. PAT001
    password     VARCHAR(255) NOT NULL,
    email        VARCHAR(100) UNIQUE NOT NULL,
    fullName     VARCHAR(100),
    contactNumber VARCHAR(20),
    role         VARCHAR(20)  DEFAULT 'PATIENT'
);

-- =============================================
-- TABLE: employees (Doctors, Pharmacists, Admins, Staff)
--        Managed via Admin Dashboard registration
-- =============================================
CREATE TABLE employees (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50)  UNIQUE NOT NULL,
    employeeId     VARCHAR(20)  UNIQUE NOT NULL,  -- e.g. DOC001, PHM001, ADM001
    password       VARCHAR(255) NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    fullName       VARCHAR(100),
    contactNumber  VARCHAR(20),
    role           VARCHAR(20)  NOT NULL,          -- DOCTOR, PHARMACY, ADMIN, STAFF
    specialty      VARCHAR(100),                   -- Doctors only
    qualifications TEXT,                           -- Doctors only
    salary         DOUBLE,
    hireDate       DATE DEFAULT (CURRENT_DATE)
);

-- =============================================
-- TABLE: Medicines
-- =============================================
CREATE TABLE Medicines (
    MedicineID    VARCHAR(20) PRIMARY KEY,
    Name          VARCHAR(100) NOT NULL,
    Category      VARCHAR(50),
    Description   VARCHAR(500),
    UnitPrice     DOUBLE       NOT NULL CHECK (UnitPrice >= 0),
    StockQuantity INT          NOT NULL CHECK (StockQuantity >= 0),
    ExpiryDate    DATE         NOT NULL,
    SupplierName  VARCHAR(150),
    CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Appointments
-- =============================================
CREATE TABLE Appointments (
    AppointmentID    BIGINT AUTO_INCREMENT PRIMARY KEY,
    PatientUsername  VARCHAR(50) NOT NULL,           -- FK → users.username
    EmployeeUsername VARCHAR(50) NOT NULL,           -- FK → employees.username (Doctor)
    AppointmentDate  DATETIME    NOT NULL,
    Status           VARCHAR(20) DEFAULT 'Scheduled',
    Symptoms         TEXT,

    FOREIGN KEY (PatientUsername)  REFERENCES users(username),
    FOREIGN KEY (EmployeeUsername) REFERENCES employees(username)
);

-- =============================================
-- TABLE: Prescriptions
-- =============================================
CREATE TABLE Prescriptions (
    PrescriptionID   VARCHAR(20) PRIMARY KEY,
    PatientUsername  VARCHAR(50),                   -- FK → users.username
    DoctorUsername   VARCHAR(50),                   -- FK → employees.username
    PrescriptionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status           ENUM('Pending', 'Dispensed', 'Cancelled') DEFAULT 'Pending',
    Notes            VARCHAR(500),

    FOREIGN KEY (PatientUsername) REFERENCES users(username),
    FOREIGN KEY (DoctorUsername)  REFERENCES employees(username)
);

-- =============================================
-- TABLE: PrescriptionItems
-- =============================================
CREATE TABLE PrescriptionItems (
    PrescriptionItemID VARCHAR(20) PRIMARY KEY,
    PrescriptionID     VARCHAR(20),
    MedicineID         VARCHAR(20),
    Quantity           INT         NOT NULL,
    Dosage             VARCHAR(100),
    Duration           VARCHAR(100),

    FOREIGN KEY (PrescriptionID) REFERENCES Prescriptions(PrescriptionID) ON DELETE CASCADE,
    FOREIGN KEY (MedicineID)     REFERENCES Medicines(MedicineID)
);

-- =============================================
-- TABLE: StockTransactions
-- =============================================
CREATE TABLE StockTransactions (
    TransactionID   VARCHAR(20) PRIMARY KEY,
    MedicineID      VARCHAR(20),
    QuantityChanged INT         NOT NULL,
    TransactionType ENUM('ADD', 'DISPENSE') NOT NULL,
    TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (MedicineID) REFERENCES Medicines(MedicineID)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_employees_role     ON employees(role);
CREATE INDEX idx_medicines_name     ON Medicines(Name);
CREATE INDEX idx_prescriptions_date ON Prescriptions(PrescriptionDate);
CREATE INDEX idx_prescriptions_status ON Prescriptions(Status);
CREATE INDEX idx_appointments_date  ON Appointments(AppointmentDate);

-- =============================================
-- VIEWS
-- =============================================

-- Full prescription summary (patient name + doctor name)
CREATE VIEW vw_PrescriptionSummary AS
SELECT
    p.PrescriptionID,
    u.fullName       AS PatientName,
    e.fullName       AS DoctorName,
    p.PrescriptionDate,
    p.Status,
    p.Notes
FROM Prescriptions p
JOIN users     u ON u.username = p.PatientUsername
JOIN employees e ON e.username = p.DoctorUsername;

-- Only pending prescriptions with full medicine line items
CREATE VIEW vw_PendingPrescriptions AS
SELECT
    p.PrescriptionID,
    u.fullName       AS PatientName,
    e.fullName       AS DoctorName,
    p.PrescriptionDate,
    p.Notes,
    pi.MedicineID,
    m.Name           AS MedicineName,
    pi.Quantity,
    pi.Dosage,
    pi.Duration
FROM Prescriptions p
JOIN users             u  ON u.username  = p.PatientUsername
JOIN employees         e  ON e.username  = p.DoctorUsername
JOIN PrescriptionItems pi ON pi.PrescriptionID = p.PrescriptionID
JOIN Medicines         m  ON m.MedicineID      = pi.MedicineID
WHERE p.Status = 'Pending';

-- =============================================
-- STORED PROCEDURE: Dispense a Prescription
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_DispensePrescription(IN p_id VARCHAR(20))
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE medID VARCHAR(20);
    DECLARE qty   INT;

    DECLARE cur CURSOR FOR
        SELECT MedicineID, Quantity
        FROM PrescriptionItems
        WHERE PrescriptionID = p_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    START TRANSACTION;

    UPDATE Prescriptions
    SET Status = 'Dispensed'
    WHERE PrescriptionID = p_id AND Status = 'Pending';

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO medID, qty;
        IF done THEN
            LEAVE read_loop;
        END IF;

        UPDATE Medicines
        SET StockQuantity = StockQuantity - qty
        WHERE MedicineID = medID;

        INSERT INTO StockTransactions
        VALUES (
            CONCAT('ST', FLOOR(RAND() * 100000)),
            medID,
            -qty,
            'DISPENSE',
            NOW()
        );
    END LOOP;

    CLOSE cur;

    COMMIT;
END$$

DELIMITER ;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Patients (password: 'password123' — bcrypt hashed)
INSERT INTO users (username, userId, password, email, fullName, contactNumber) VALUES
('johndoe',   'PAT001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'john@gmail.com', 'John Doe',   '5550101'),
('janesmith', 'PAT002', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'jane@gmail.com', 'Jane Smith',  '5550102');

-- Employees (password: 'password123' — bcrypt hashed)
INSERT INTO employees (username, employeeId, password, email, fullName, role, specialty) VALUES
('admin',      'ADM001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'admin@medicare.com',  'System Admin',      'ADMIN',    NULL),
('drjames',    'DOC001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'james@medicare.com',  'Dr. James Wilson',  'DOCTOR',   'Cardiology'),
('pharma_one', 'PHM001', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvS.X.e45607k4bHh799n8Z6M6.b0y', 'store@medicare.com',  'Sarah Pharma',      'PHARMACY', NULL);

-- Medicines
INSERT INTO Medicines (MedicineID, Name, Category, Description, UnitPrice, StockQuantity, ExpiryDate, SupplierName) VALUES
('MED001', 'Paracetamol', 'Analgesic',   'Pain relief', 5.00,  100, '2026-12-31', 'Supplier A'),
('MED002', 'Amoxicillin', 'Antibiotic',  'Antibiotic',  12.50,  50, '2025-11-30', 'Supplier B');

-- Prescription (PatientUsername + DoctorUsername)
INSERT INTO Prescriptions (PrescriptionID, PatientUsername, DoctorUsername, Status, Notes) VALUES
('PRES001', 'johndoe', 'drjames', 'Pending', 'Take after meals');

-- Prescription Line Item
INSERT INTO PrescriptionItems (PrescriptionItemID, PrescriptionID, MedicineID, Quantity, Dosage, Duration) VALUES
('PI001', 'PRES001', 'MED001', 10, '500mg', '5 days');

-- Stock Transaction
INSERT INTO StockTransactions (TransactionID, MedicineID, QuantityChanged, TransactionType) VALUES
('ST001', 'MED001', 100, 'ADD');