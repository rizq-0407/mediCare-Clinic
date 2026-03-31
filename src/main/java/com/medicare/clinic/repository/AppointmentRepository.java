package com.medicare.clinic.repository;

import com.medicare.clinic.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(String patientId);
    List<Appointment> findByStatus(String status);
    List<Appointment> findByDoctorNameContainingIgnoreCase(String doctorName);
}
