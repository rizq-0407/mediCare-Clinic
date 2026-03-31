package com.medicare.clinic.repository;

import com.medicare.clinic.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, String> {

    List<Prescription> findByPatientId(String patientId);

    List<Prescription> findByStatus(String status);

    List<Prescription> findByDoctorId(String doctorId);
}
