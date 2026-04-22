package com.medicare.clinic.service;

import com.medicare.clinic.model.Schedule;
import com.medicare.clinic.repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService {

    private final ScheduleRepository repository;

    public ScheduleService(ScheduleRepository repository) {
        this.repository = repository;
    }

    public List<Schedule> getAllSchedules() {
        return repository.findAll();
    }

    public Schedule addSchedule(Schedule schedule) {
        if (repository.existsByRoomNumberAndDateAndTime(schedule.getRoomNumber(), schedule.getDate(), schedule.getTime())) {
            throw new RuntimeException("This room is already occupied at the specified time.");
        }
        if (repository.existsByDoctorNameAndDateAndTime(schedule.getDoctorName(), schedule.getDate(), schedule.getTime())) {
            throw new RuntimeException("This doctor is already scheduled for another session at this time.");
        }
        return repository.save(schedule);
    }

    public Schedule updateSchedule(Long id, Schedule schedule) {
        Schedule existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        if (repository.existsByRoomNumberAndDateAndTimeAndIdNot(schedule.getRoomNumber(), schedule.getDate(), schedule.getTime(), id)) {
            throw new RuntimeException("Room conflict with another schedule.");
        }

        existing.setDoctorName(schedule.getDoctorName());
        existing.setSpecialization(schedule.getSpecialization());
        existing.setDate(schedule.getDate());
        existing.setTime(schedule.getTime());
        existing.setRoomNumber(schedule.getRoomNumber());
        existing.setAvailableSlots(schedule.getAvailableSlots());

        return repository.save(existing);
    }

    public void deleteSchedule(Long id) {
        repository.deleteById(id);
    }

    public Schedule bookSchedule(Long id, String patientId) {
        Schedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        if (schedule.getAvailableSlots() <= 0) {
            throw new RuntimeException("No slots available");
        }
        schedule.setAvailableSlots(schedule.getAvailableSlots() - 1);
        return repository.save(schedule);
    }

    public Schedule requestScheduleUpdate(Long id, Schedule request) {
        Schedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        schedule.setUpdateRequest("PENDING");
        schedule.setRequestedDate(request.getRequestedDate());
        schedule.setRequestedTime(request.getRequestedTime());
        schedule.setRequestedRoom(request.getRequestedRoom());
        schedule.setAdminResponse(null);
        
        return repository.save(schedule);
    }

    @Transactional
    public Schedule approveScheduleRequest(Long id) {
        Schedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        if (!"PENDING".equals(schedule.getUpdateRequest())) {
            throw new RuntimeException("No pending request for this schedule");
        }

        // Check conflicts for requested slot
        if (repository.existsByRoomNumberAndDateAndTimeAndIdNot(schedule.getRequestedRoom(), schedule.getRequestedDate(), schedule.getRequestedTime(), id)) {
            throw new RuntimeException("Requested room is already taken for that slot.");
        }

        schedule.setDate(schedule.getRequestedDate());
        schedule.setTime(schedule.getRequestedTime());
        schedule.setRoomNumber(schedule.getRequestedRoom());
        schedule.setUpdateRequest(null);
        schedule.setRequestedDate(null);
        schedule.setRequestedTime(null);
        schedule.setRequestedRoom(null);
        schedule.setAdminResponse("APPROVED");
        
        return repository.save(schedule);
    }

    public Schedule rejectScheduleRequest(Long id, String reason) {
        Schedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        schedule.setUpdateRequest(null);
        schedule.setRequestedDate(null);
        schedule.setRequestedTime(null);
        schedule.setRequestedRoom(null);
        schedule.setAdminResponse("REJECTED: " + reason);
        
        return repository.save(schedule);
    }

    public Schedule dismissAdminResponse(Long id) {
        Schedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        schedule.setAdminResponse(null);
        return repository.save(schedule);
    }

    @Transactional
    public List<Schedule> addBulkSchedules(BulkScheduleRequest request) {
        LocalDate start = LocalDate.parse(request.startDate);
        LocalDate end = LocalDate.parse(request.endDate);
        List<Schedule> created = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            String dayName = date.getDayOfWeek().name();
            if (request.daysOfWeek.contains(dayName)) {
                Schedule s = new Schedule();
                s.setDoctorName(request.doctorName);
                s.setSpecialization(request.specialization);
                s.setDate(date.format(DateTimeFormatter.ISO_LOCAL_DATE));
                s.setTime(request.time);
                s.setRoomNumber(request.roomNumber);
                s.setAvailableSlots(request.availableSlots);
                
                if (!repository.existsByRoomNumberAndDateAndTime(s.getRoomNumber(), s.getDate(), s.getTime()) &&
                    !repository.existsByDoctorNameAndDateAndTime(s.getDoctorName(), s.getDate(), s.getTime())) {
                    created.add(repository.save(s));
                }
            }
        }
        return created;
    }

    public List<Schedule> searchSchedules(String doctor, String specialization, String date) {
        String d = doctor != null ? doctor : "";
        String s = specialization != null ? specialization : "";
        String dt = date != null ? date : "";
        return repository.findByDoctorNameContainingIgnoreCaseAndSpecializationContainingIgnoreCaseAndDateContainingIgnoreCase(d, s, dt);
    }

    public static class BulkScheduleRequest {
        public String doctorName;
        public String specialization;
        public String startDate;
        public String endDate;
        public String time;
        public String roomNumber;
        public int availableSlots;
        public List<String> daysOfWeek;
    }
}
