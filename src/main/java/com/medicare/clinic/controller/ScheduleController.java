package com.medicare.clinic.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medicare.clinic.model.Schedule;
import com.medicare.clinic.service.ScheduleService;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService service;

    // ✅ CREATE
    @PostMapping
    public ResponseEntity<?> add(@RequestBody Schedule schedule) {
        try {
            return ResponseEntity.ok(service.addSchedule(schedule));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ READ
    @GetMapping
    public List<Schedule> getAll() {
        return service.getAllSchedules();
    }

    // ✅ UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Schedule schedule) {
        try {
            return ResponseEntity.ok(service.updateSchedule(id, schedule));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteSchedule(id);
    }

    // ✅ BOOK (Patient side)
    @PostMapping("/book/{id}")
    public Schedule book(@PathVariable Long id, @RequestParam String patientId) {
        return service.bookSchedule(id, patientId);
    }

    // ✅ DOCTOR REQUEST (STRUCTURED)
    @PutMapping("/{id}/request")
    public ResponseEntity<?> requestUpdate(@PathVariable Long id, @RequestBody Schedule request) {
        try {
            return ResponseEntity.ok(service.requestScheduleUpdate(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ ADMIN APPROVE
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.approveScheduleRequest(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ ADMIN REJECT / MARK AS TAKEN
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody(required = false) java.util.Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : "Slot already occupied";
            return ResponseEntity.ok(service.rejectScheduleRequest(id, reason));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ DOCTOR DISMISS ADMIN RESPONSE
    @PutMapping("/{id}/dismiss-response")
    public ResponseEntity<?> dismissResponse(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.dismissAdminResponse(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ BULK ADD
    @PostMapping("/bulk")
    public ResponseEntity<?> addBulk(@RequestBody ScheduleService.BulkScheduleRequest request) {
        try {
            return ResponseEntity.ok(service.addBulkSchedules(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ SEARCH FOR PATIENTS
    @GetMapping("/search")
    public List<Schedule> search(
            @RequestParam(required = false) String doctor,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String date) {
        return service.searchSchedules(doctor, specialization, date);
    }
}