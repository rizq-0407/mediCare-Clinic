package com.medicare.clinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.medicare.clinic.model.Schedule;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    boolean existsByRoomNumberAndDateAndTime(String roomNumber, String date, String time);
    boolean existsByRoomNumberAndDateAndTimeAndIdNot(String roomNumber, String date, String time, Long id);
    boolean existsByDoctorNameAndDateAndTime(String doctorName, String date, String time);
    boolean existsByDoctorNameAndDateAndTimeAndIdNot(String doctorName, String date, String time, Long id);

    List<Schedule> findByDoctorNameContainingIgnoreCaseAndSpecializationContainingIgnoreCaseAndDateContainingIgnoreCase(String doctorName, String specialization, String date);
}