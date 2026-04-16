package com.medicare.clinic.repository;

import com.medicare.clinic.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientUsernameOrderByCreatedAtDesc(String patientUsername);

    List<MedicalRecord> findByPatientFullNameContainingIgnoreCaseOrderByCreatedAtDesc(String patientFullName);

    List<MedicalRecord> findAllByOrderByCreatedAtDesc();
}
