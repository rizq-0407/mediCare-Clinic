package com.medicare.clinic.controller;

import com.medicare.clinic.dto.MedicalRecordDTO;
import com.medicare.clinic.service.MedicalRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emr")
@CrossOrigin(origins = "*")
public class EmrController {

    private final MedicalRecordService service;

    // ✅ FIX: manual constructor (no Lombok issue)
    public EmrController(MedicalRecordService service) {
        this.service = service;
    }

    // ✅ FIXED: Patient sees only own records
    @GetMapping
    public ResponseEntity<List<MedicalRecordDTO>> getAllRecords(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();

        boolean isPatient = authentication.getAuthorities().stream()
                .anyMatch(a ->
                        a.getAuthority().equals("ROLE_PATIENT") ||
                                a.getAuthority().equals("PATIENT")
                );

        if (isPatient) {
            return ResponseEntity.ok(service.getRecordsByPatientUsername(username));
        }

        return ResponseEntity.ok(service.getAllRecords());
    }

    @GetMapping("/patient/{username}")
    public ResponseEntity<List<MedicalRecordDTO>> getRecordsByPatientUsername(
            @PathVariable String username) {
        return ResponseEntity.ok(service.getRecordsByPatientUsername(username));
    }

    @PostMapping
    public ResponseEntity<MedicalRecordDTO> createRecord(
            @RequestBody MedicalRecordDTO dto) {
        return ResponseEntity.ok(service.createRecord(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecordDTO> updateRecord(
            @PathVariable Long id,
            @RequestBody MedicalRecordDTO dto) {
        return ResponseEntity.ok(service.updateRecord(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable Long id) {
        service.deleteRecord(id);
        return ResponseEntity.ok().build();
    }
}