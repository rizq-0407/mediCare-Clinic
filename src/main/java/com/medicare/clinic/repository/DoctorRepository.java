package com.medicare.clinic.repository;

import com.medicare.clinic.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecialtyContainingIgnoreCase(String specialty);
    List<Doctor> findByIsAvailableTrue();
}
